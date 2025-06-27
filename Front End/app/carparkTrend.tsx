import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { CartesianChart, Line, useChartPressState } from "victory-native"
import { useFont, Circle, Text as SKText } from '@shopify/react-native-skia'
import { SharedValue, useDerivedValue, Easing } from 'react-native-reanimated'
import TimeRangeSelector from '@/components/TimeRangeSelector'
import { subMonths, subYears } from 'date-fns';
import { scaleTime } from 'd3-scale';
import { timeMinute } from 'd3-time';
import Button from '@/components/Button'
import CarparkList from '@/components/CarparkList'
import { useLocalSearchParams } from 'expo-router';


type CarparkTrendProps = {
  carpark: Carpark
}

type CarparkAvailability = {
  available: number;
  recorded_at: string;
};

const SpaceMono = require("../assets/fonts/SpaceMono-Regular.ttf")


function ToolTip({ x, y, value }: { x: SharedValue<number>; y: SharedValue<number>, value: SharedValue<number> }) {
  const label = useDerivedValue(() => `Availability: ${value.value}`, [value]);
  const font = useFont(SpaceMono, 10)
  return (
    <>
      <Circle cx={x} cy={y} r={8} color={"grey"} opacity={0.8} />
      <SKText
        x={x}
        y={useDerivedValue(() => y.value - 12, [y])} // display above circle
        text={label}
        font={font}
        color="black"
      />
    </>

  )


}

export default function CarparkTrend() {
  const { carpark } = useLocalSearchParams();
  const parsedCarpark: Carpark = JSON.parse(carpark as string); 
  const [graphData, setGraphData] = useState<{ time: number, availability: number }[]>([]);
  const [forecastData, setForecastData] = useState<{ time: number, availability: number }[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedRange, setSelectedRange] = useState<'Hour' | '6hr' | 'Day' | 'Month' | 'Year'>('Hour');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const fonts = useFont(SpaceMono, 8)
  const { state, isActive } = useChartPressState({
    x: 0,
    y: { availability: 0 }   // Note: This should match the yKeys in CartesianChart
  });

  useEffect(() => {
    const getCurrentTime = async () => {
      try {
        const response = await fetch("https://orbital-1y2b.onrender.com/getCurrentTimeDemo");
        if (!response.ok) throw new Error("Current Time not Available");
        const data = await response.json();
        const latestTime = new Date(data[0].latest_time).getTime();
        //console.log("latest", latestTime)
        setCurrentTime(latestTime);
      } catch (error) {
        console.log("Failed to fetch current time", error);
      }
    };

    const getForecast = async () => {
      try {
        const response = await fetch(`https://orbital-1y2b.onrender.com/getAvailabilityForecastDemo/${parsedCarpark.id}`, {
          method: 'POST',
        });
        if (!response.ok || response.status == 500) throw new Error("Forecast not available");
        const data = await response.json();

        if (!data.forecast || !Array.isArray(data.forecast)) {
          console.log("Unexpected forecast format:", data);
          return;
        }

        const processedData = data.forecast.map((entry: CarparkAvailability) => ({
          time: new Date(entry.recorded_at).getTime(),
          availability: Number(entry.available)
        }));

        setForecastData(processedData)
        console.log("forecast done")
      } catch (error) {
        console.log("Failed to get forecast", error)
      }
    }

    getCurrentTime();
    getForecast();
  }, []);

  useEffect(() => {
    if (currentTime === 0) return;

    let rangeStart = currentTime;

    switch (selectedRange) {
      case 'Hour':
        rangeStart = currentTime - 3600000;
        setEndTime(currentTime);
        break;
      case '6hr':
        rangeStart = currentTime - 21600000;
        setEndTime(currentTime);
        break;
      case 'Day':
        rangeStart = currentTime - 86400000;
        setEndTime(currentTime);
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
  }, [selectedRange, currentTime]);

  useEffect(() => {
    if (startTime === 0 || endTime === 0) return;

    const getAvailabilityHistory = async () => {
      console.log("CarparkTrend received carpark:", carpark);
      try {
        const response = await fetch(`https://orbital-1y2b.onrender.com/fetchCarparkHistoryDemo/${parsedCarpark.id}/${startTime / 1000}/${endTime / 1000}`);
        if (!response.ok) throw new Error("Carpark History not Available");
        const data: CarparkAvailability[] = await response.json();
        //console.log(data)
        const processedData = data.map(entry => ({
          time: new Date(entry.recorded_at).getTime(),
          availability: Number(entry.available)
        }));
        //console.log(processedData)
        setGraphData(processedData);
      } catch (error) {
        console.log("Error fetching history:", error);
      }
    };

    getAvailabilityHistory();
  }, [startTime, endTime]);

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
    <View style={{ height: 600, justifyContent: 'center' }}>
      <CartesianChart
        data={graphData}
        xKey={"time"}
        yKeys={["availability"]}
        domainPadding={{ top: 10, bottom: 20, left: 10, right: 10 }}
        chartPressState={state}
        viewport={{ x: [startTime, endTime + 300000] }}
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
              {
                isActive ? (
                  <ToolTip x={state.x.position} y={state.y.availability.position} value={state.y.availability.value} />
                ) : null
              }
            </>

          )
        }}

      </CartesianChart>
      <TimeRangeSelector selected={selectedRange} onSelect={setSelectedRange}></TimeRangeSelector>
      <Button label="forecast" onPress={() => {
        if (forecastData.length > 0) {
          const minTime = Math.min(...forecastData.map(d => d.time));
          const maxTime = Math.max(...forecastData.map(d => d.time));
          console.log(minTime, " ", maxTime)
          console.log(currentTime)

          setGraphData(forecastData);
          setStartTime(minTime);
          setEndTime(maxTime);
        }
      }}></Button>
    </View>

  )
}

const styles = StyleSheet.create({})