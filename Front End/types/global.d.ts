type Carpark = {
  name: string;
  id: number;
  type: string;
  staff: boolean;
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  distance? : number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
  latitudeDelta? : number;
  longitudeDelta? : number;
}

type UserData = {
  username? : string;
  email? : string;
  staff: boolean;
  season_parking: boolean;
  season_parking_type?: string
}