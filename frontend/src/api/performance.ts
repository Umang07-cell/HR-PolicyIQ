import { client } from "./client";
export const getMyReviews = () => client.get("/performance/my");
export const getTeamReviews = () => client.get("/performance/team");
export const createReview = (data: any) => client.post("/performance/review", data);
export const submitReview = (id: number) => client.post(`/performance/${id}/submit`);
