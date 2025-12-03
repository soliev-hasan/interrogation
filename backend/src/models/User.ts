export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "investigator" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// Mock data for users
export const users: User[] = [
  {
    id: 1,
    username: "investigator1",
    email: "investigator1@example.com",
    password: "$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWsEsdJ6uP/E3WABzUlQAR4mFeoC", // password: investigator1
    role: "investigator",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    username: "admin1",
    email: "admin1@example.com",
    password: "$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWsEsdJ6uP/E3WABzUlQAR4mFeoC", // password: admin1
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    username: "admin2",
    email: "admin2@example.com",
    password: "$2b$10$oAsvX3p/IaKnqvVdrqwoU.e9a5saKOLlspp4lvbTQldu8RD4rC9Dy", // password: admin2
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
