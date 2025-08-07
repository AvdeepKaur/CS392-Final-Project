//interface User
export interface User {
  _id: string;
  email: string;
  name: string;
  passwordHash?: string;
  favoriteLocationIds: string[];
}
