export interface User {
  id: string;
  username: string;
}

export interface UserApiResponse {
  success: boolean;
  user: User;
}
