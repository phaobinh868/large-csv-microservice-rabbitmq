import mongoose from "mongoose";
export default async function connectDB() {
    await mongoose
    .connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Data Service Connected to MongoDB"))
    .catch((e) => console.log(e));
}