import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CartesianChart, Line, useChartPressState } from "victory-native"
import { useFont, Circle, Text as SKText } from '@shopify/react-native-skia'
import { SharedValue, useDerivedValue } from 'react-native-reanimated'

type CarparkTrendProps = {
  carpark: Carpark
}

type CarparkAvailability = {
  id: number;
  carpark_id: number;
  available: number;
  total: number;
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

export default function CarparkTrend({ carpark }: CarparkTrendProps) {
  const [graphData, setGraphData] = useState<{ time: number, availability: number }[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0)
  const fonts = useFont(SpaceMono, 8)
  const { state, isActive } = useChartPressState({
    x: 0,
    y: { availability: 0 }   // Note: This should match the yKeys in CartesianChart
  });

  useEffect(() => {
    const getAvailabilityHistory = async (carpark: Carpark) => {
      try {
        const response = await fetch(`http://192.168.68.60:3000/fetchCarparkHistory/1`)

        if (response.status === 404 || !response.ok) throw new Error("Carpark History not Available")
        const data: CarparkAvailability[] = await response.json();

        const processedData = data.map(entry => ({
          time: new Date(entry.recorded_at).getTime(),
          availability: entry.available
        }))

        setCurrentTime(processedData.slice(-1)[0].time)
        console.log(processedData.slice(-3))
        setGraphData(processedData)

      } catch (error) {
        console.log(error)
      }
    }

    getAvailabilityHistory(carpark)
  }, [])


  useEffect(() => {
    console.log(isActive)
  }, [isActive])

  return (
    <View style={{ height: 600, justifyContent:'center' }}>
      <CartesianChart
        data={graphData}
        xKey={"time"}
        yKeys={["availability"]}
        domainPadding={{ top: 10, bottom: 20, left:20, right: 10 }}
        chartPressState={state}
        viewport={{x:[currentTime- 3600000, currentTime]}}
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
          
        }}
        yAxis={[{
          font: fonts,
          labelPosition: 'inset'
        }]}

      >
        {({ points, chartBounds }) => {
          return (
            <>
              <Line
                points={points.availability}
                color={"green"}
                strokeWidth={3}
                animate={{ type: 'timing', duration: 500 }}
                curveType='linear'

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
    </View>
  )
}

const styles = StyleSheet.create({})