import mongoose from 'mongoose';

const mongoURI = process.env.MONGO_URI;



let isConnected = false;

export const connectToDb = async () => {
    mongoose.set('strictQuery', true);
    if (!mongoURI) {
        throw new Error('MONGO_URI environment variable is not defined');
    }
    if (isConnected) console.log("already connected");

    try {
        await mongoose.connect(mongoURI);

        isConnected = true;
        console.log("connected to mongodb");
    }
    catch (error) {
        console.log(error);
    }
}