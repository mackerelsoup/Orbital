import { StyleSheet, Text, View, Dimensions, Modal, Pressable } from 'react-native'
import React, { useEffect, useState, useMemo, useLayoutEffect } from 'react'
import { CartesianChart, Line, useChartPressState } from "victory-native"
import { useFont, Circle, Text as SKText, RoundedRect } from '@shopify/react-native-skia'
import { SharedValue, useDerivedValue, Easing } from 'react-native-reanimated'
import TimeRangeSelector from '@/components/TimeRangeSelector'
import { subMonths, subYears, subWeeks } from 'date-fns';
import { scaleTime } from 'd3-scale';
import { timeMinute } from 'd3-time';
import SquareButton from '@/components/SquareButton'
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Portal } from 'react-native-portalize'
import carparks from '../../assets/carparks.json';



type CarparkAvailability = {
  available: number;
  timestamp: string;
};

type TooltipProps = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  availValue: SharedValue<number>;
  timeValue: SharedValue<number>;
  screenWidth?: number;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SpaceMono = require("../../assets/fonts/SpaceMono-Regular.ttf");

function ToolTipWithBackground({ x, y, availValue, timeValue, screenWidth = SCREEN_WIDTH }: TooltipProps) {
  const font = useFont(SpaceMono, 10);
  const availLabel = useDerivedValue(() => `Availability: ${availValue.value}`, [availValue]);
  const timeLabel = useDerivedValue(() => {
    const date = new Date(timeValue.value);
    return `Time: ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }, [timeValue]);

  const textWidth = 130;
  const textHeight = 16;
  const padding = 4;

  const textX = useDerivedValue(() => {
    const circleX = x.value;
    const margin = 10; // minimum margin from screen edges
    const halfTextWidth = textWidth / 2;
    const totalWidth = textWidth + padding * 2; // total tooltip width including padding

    // Start by centering the tooltip horizontally over the circle
    let startX = circleX - halfTextWidth;
    // Clamp to screen edges with margin:
    if (startX < margin) {
      startX = margin + 20;
    }
    if (startX + totalWidth > screenWidth - margin) {
      startX = screenWidth - margin - totalWidth;
    }

    return startX;
  }, [x]);

  const textY = useDerivedValue(() => y.value - 15, [y]);
  const backgroundX = useDerivedValue(() => textX.value - padding, [textX]);
  const backgroundY = useDerivedValue(() => textY.value - textHeight + 2, [textY]);

  return (
    <>
      <Circle cx={x} cy={y} r={8} color="grey" opacity={0.8} />
      <RoundedRect
        x={backgroundX}
        y={backgroundY}
        width={textWidth + padding * 2}
        height={textHeight * 2 + padding}
        color="white"
        opacity={0.9}
        r={4}
      />
      <SKText
        x={useDerivedValue(() => textX.value + padding, [textX])}
        y={textY}
        text={availLabel}
        font={font}
        color="black"
      />
      <SKText
        x={useDerivedValue(() => textX.value + padding, [textX])}
        y={useDerivedValue(() => textY.value + textHeight - 1, [textY])}
        text={timeLabel}
        font={font}
        color="black"
      />
    </>
  );
}

export default function CarparkTrend() {
  const { carparkId } = useLocalSearchParams();
  const [graphData, setGraphData] = useState<{ time: number, availability: number }[]>([]);
  const [forecastData, setForecastData] = useState<{ time: number, availability: number }[]>([]);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedRange, setSelectedRange] = useState<'4HR' | 'Day' | 'Week' | 'Month' | 'Year'>('4HR');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const fonts = useFont(SpaceMono, 8);
  const [isForecastMode, setIsForecastMode] = useState(false);
  const { state, isActive } = useChartPressState({
    x: 0,
    y: { availability: 0 }   // Note: This should match the yKeys in CartesianChart
  });
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${carparks[Number(carparkId) - 1].name} Trend`
    })
  })

  useEffect(() => {
    const getCurrentTime = async () => {
      try {
        const response = await fetch("http://10.54.169.229:3000/getCurrentTime");
        if (!response.ok) throw new Error("Current Time not Available");
        const data = await response.json();
        const latestTime = new Date(data.latest_time).getTime();
        //console.log("latest", latestTime)
        //console.log(new Date(latestTime).toLocaleString("en-US", { timeZone: "Asia/Singapore" }))
        setCurrentTime(latestTime);
      } catch (error) {
        console.log("Failed to fetch current time", error);
      }
    };

    const getForecast = async () => {
      console.log("running forcecast:", carparkId);
      setForecastData([])
      try {


        const response = await fetch(`http://10.54.169.229:3000/getAvailabilityForecast/${carparkId}`, {
          method: 'POST',
        });
        if (!response.ok || response.status == 500) throw new Error("Forecast not available");
        const data = await response.json();

        //console.log(data)

        /*
        if (!data.forecast || !Array.isArray(data.forecast)) {
          console.warn("Unexpected forecast format:", data);
          throw new Error("Forecast not available");
        }
        */


        //hard coded for this milestone
        //const data = forecasts
        console.log("forecast", data)

        const processedData = data.map((entry: any) => ({
          time: new Date(entry.timestamp).getTime() + (8 * 60 * 60 * 1000),
          availability: Number(entry.available)
        }));

        //console.log("processed", processedData)

        setForecastData(processedData)
        console.log("forecast done")
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log("Failed to get forecast", error.message);
        } else {
          console.log("Failed to get forecast", error);
        }
      }
    }

    getCurrentTime();
    getForecast();
  }, [carparkId]);

  useEffect(() => {
    if (currentTime === 0) return;

    let rangeStart = currentTime;

    switch (selectedRange) {
      case '4HR':
        rangeStart = currentTime - 14400000;
        setEndTime(currentTime);
        break;
      case 'Day':
        rangeStart = currentTime - 86400000;
        setEndTime(currentTime);
        break;
      case 'Week':
        rangeStart = subWeeks(currentTime, 1).getTime();
        setEndTime(rangeStart + 86400000);
        break;
      case 'Month':
        rangeStart = subMonths(currentTime, 1).getTime();
        setEndTime(rangeStart + 86400000);
        break;
      case 'Year':
        rangeStart = subYears(currentTime, 1).getTime();
        setEndTime(rangeStart + 86400000);
        break;
    }

    //console.log(rangeStart)
    setStartTime(rangeStart);
  }, [selectedRange, currentTime, carparkId]);

  useEffect(() => {
    if (startTime === 0 || endTime === 0 || isForecastMode) {
      setIsForecastMode(false)
      return;
    }


    const getAvailabilityHistory = async () => {
      //console.log("CarparkTrend received carpark:", carpark);
      setGraphData([]);
      try {
        console.log(startTime, "  " ,endTime)
        const response = await fetch(`http://10.54.169.229:3000/fetchCarparkHistory/${carparkId}/${startTime / 1000}/${endTime / 1000}`);
        if (!response.ok) throw new Error("Carpark History not Available");
        const data: CarparkAvailability[] = await response.json();
        //console.log(data)
        const processedData = data.map(entry => ({
          time: new Date(entry.timestamp).getTime(),
          availability: Number(entry.available)
        }));
        //console.log(processedData)
        setGraphData(processedData);
      } catch (error) {
        console.log("Error fetching history:", error);
      }
    };

    getAvailabilityHistory();
  }, [startTime, endTime, carparkId]);

  const tickValues = useMemo(() => {
    if (!startTime || !endTime) return [];

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    //console.log(startDate, " ", endDate)

    const scale = scaleTime()
      .domain([startDate, endDate]);

    // Generate ticks every 15 minutes
    const interval = timeMinute.every(15);
    //console.log(interval ? scale.ticks(interval).map(d => d.getTime()) : [])
    return interval ? scale.ticks(interval).map(d => d.getTime()) : [];
  }, [startTime, endTime]);



  return (
    <View>
      <Portal>
        <Modal
          visible={showForecastModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowForecastModal(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Forecast not ready</Text>
              <Pressable onPress={() => setShowForecastModal(false)} style={styles.modalButton}>
                <Text style={{ color: 'white' }}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </Portal>

      <View style={[{ height: 600, justifyContent: 'center' }, styles.chartContainer]}>
        <CartesianChart
          data={graphData}
          xKey={"time"}
          yKeys={["availability"]}
          domainPadding={{ top: 10, bottom: 20, left: 10, right: 10 }}
          chartPressState={state}
          viewport={{ x: [startTime, endTime + 10 * 60 * 1000] }}
          xAxis={{
            font: fonts,
            formatXLabel(label) {
              const date = new Date(label);
              return date.toLocaleTimeString('en-SG', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
            },
            labelOffset: -30,
            tickValues: tickValues

          }}
          yAxis={[{
            font: fonts,
            labelPosition: 'outset'
          }]}
        >
          {({ points, chartBounds }) => {
            return (
              <>
                <Line
                  points={points.availability}
                  color={"green"}
                  strokeWidth={3}
                  animate={{
                    type: 'timing',
                    duration: 500,
                    easing: Easing.out(Easing.quad),
                  }}
                  curveType='monotoneX'


                ></Line>
                {isActive &&
                  <ToolTipWithBackground x={state.x.position} y={state.y.availability.position} availValue={state.y.availability.value} timeValue={state.x.value} />}

              </>

            )
          }}

        </CartesianChart>
        <TimeRangeSelector selected={selectedRange} onSelect={setSelectedRange}></TimeRangeSelector>
      </View>
      <View style={{ alignItems: 'center' }}>
        <SquareButton
          label='Forecast'
          size={150}
          backgroundColor={forecastData.length == 0 ? 'grey' : 'red'}
          onPress={() => {
            if (forecastData.length == 0) {
              setShowForecastModal(true);
              return;
            }
            else {
              //console.log(forecastData)
              const minTime = Math.min(...forecastData.map(d => d.time));
              const maxTime = Math.max(...forecastData.map(d => d.time));
              console.log(minTime, " ", maxTime)
              console.log(currentTime)

              setGraphData(forecastData);
              setStartTime(minTime);
              setEndTime(maxTime);
              setIsForecastMode(true);
            }

          }}
        >
        </SquareButton>
      </View>

    </View>

  )
}

const styles = StyleSheet.create({
  chartContainer: {
    height: 600,
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#fdfdfd',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    justifyContent: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
})