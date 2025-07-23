from fastapi import FastAPI, Request
from prophet import Prophet
import pandas as pd


app = FastAPI()

@app.post("/forecast")
async def forecast_carpark(request: Request):
    data = await request.json()

    df = pd.DataFrame(data)
    df['time'] = pd.to_datetime(df['timestamp'])
    df['time'] = df['time'].dt.tz_localize(None)
    df['available'] = df['available'].astype(int)
    df = df[['time', 'available']].sort_values('time')
    df_prophet = df.rename(columns={'time': 'ds', 'available': 'y'})

    latest_time = df_prophet['ds'].max()
    test_start_time = latest_time - pd.Timedelta(hours=24)
    df_train = df_prophet[df_prophet['ds'] <= test_start_time].copy()
    df_test = df_prophet[df_prophet['ds'] >= test_start_time].copy()

    model = Prophet(daily_seasonality=True, weekly_seasonality=True, seasonality_mode='additive')
    model.fit(df_train)

    n_periods = len(df_test)
    future = model.make_future_dataframe(periods=n_periods, freq='15min')
    forecast = model.predict(future)
    forecast_result = forecast[['ds', 'yhat']].set_index('ds').loc[df_test['ds']]
    forecast_result['yhat'] = forecast_result['yhat'].round(1)
    
    response = forecast_result.reset_index().rename(columns={
        'ds': 'timestamp',
        'yhat': 'available'
    }).to_dict(orient='records')



    return response

@app.get("/")
def home():
    return {"message": "Carpark Forecast API. Use POST /forecast with JSON input."}

