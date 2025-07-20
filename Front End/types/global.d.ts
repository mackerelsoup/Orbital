type Carpark = {
  available_lots: number;
  name: string;
  id: number;
  type: string;
  staff: boolean;
  season_parking_type?: string[]
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  distance?: number;
  pricing?: {
    rate_per_minute?: number;
    charged_hours?: string;
  }
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
  season_parking_type?: string;
  profile_uri:string;
}