import pandas as pd
from prophet import Prophet
import sys
import json


# Read and phrase json file
input_carpark_json = sys.stdin.read()
data = json.loads(input_carpark_json)


df = pd.DataFrame(data)
df['time'] = pd.to_datetime(df['recorded_at'])
df['time'] = df['time'].dt.tz_localize(None)
df['available'] = df['available'].astype(int)
df = df[['time', 'available']].sort_values('time')

# Rename for Prophet
df_prophet = df.rename(columns={'time': 'ds', 'available': 'y'})

# --- 2. Split train/test (last 2 hours = 8 * 15min) ---
latest_time = df_prophet['ds'].max()
test_start_time = latest_time - pd.Timedelta(hours=24)

df_train = df_prophet[df_prophet['ds'] <= test_start_time].copy()
df_test = df_prophet[df_prophet['ds'] > test_start_time].copy()

#print(f"Train set size: {len(df_train)}, Test set size: {len(df_test)}")

# --- 3. Train Prophet model ---
model = Prophet(
    daily_seasonality=True,
    weekly_seasonality=True,
    seasonality_mode='additive'
)
model.fit(df_train)

# --- 4. Create future dataframe (match test set length = 8 periods of 15min) ---
n_periods = len(df_test)
future = model.make_future_dataframe(periods=n_periods, freq='15min')

# --- 5. Forecast ---
forecast = model.predict(future)

# Extract only forecast for the test range
forecast_result = forecast[['ds', 'yhat']].set_index('ds').loc[df_test['ds']]
print(forecast_result.reset_index().rename(columns = {
  'ds': 'recorded_at',
  'yhat': 'available'
}).to_json(orient='records', date_format='iso'))


