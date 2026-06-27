import { client } from "./client";
export const fileGrievance = (data: any) => client.post("/grievance/", data);
export const getMyGrievances = () => client.get("/grievance/my");
export const getAllGrievances = () => client.get("/grievance/all");
export const updateGrievance = (id: number, data: any) => client.patch(`/grievance/${id}`, data);
