"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.models";
import { connectToDb } from "../mongoose";
import Flick from "../models/flick.model";
import { FilterQuery, SortOrder } from "mongoose";


interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser({
    userId,
    bio,
    name,
    path,
    username,
    image,
}: Params): Promise<void> {
    connectToDb();

    try {
        await User.findOneAndUpdate(
            { id: userId },
            { username: username.toLowerCase(), name, bio, image, onboarded: true },
            { upsert: true }  //update and insert both
        );

        if (path === '/profile/edit') {
            revalidatePath(path);  //nextjs func to revalidate data associated with a specific path. used to update cached data
        }
    }
    catch (error: any) {
        throw new Error(`Failed to create/update User: ${error.message}`)
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDb();
        return await User.findOne({ id: userId })
        // .populate({
        //     path: 'communities',
        //     model: 'Community'
        // })
    } catch (error: any) {
        throw new Error(`Failed to fetch user ${error.message}`)
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDb();

        //todo: populate community

        const flicks = await User.findOne({ id: userId }).
            populate({
                path: 'flicks',
                model: Flick,
                populate: {
                    path: 'children',
                    model: Flick,
                    populate: {
                        path: 'author',
                        model: User,
                        select: 'name image id'
                    }
                }
            })
        return flicks;
    }
    catch (error: any) {
        throw new Error(`Failed to fetch user posts ${error.message}`);
    }
}

export async function fetchUsers({ userId, searchString = "", pageNumber = 1, pageSize = 20, sortBy = "desc"
}: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder
}) {
    try {
        connectToDb();
        const skipAmount = (pageNumber - 1) * pageSize;
        const regex = new RegExp(searchString, "i");
        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        }
        if (searchString.trim() !== '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }

        const sortOptions = { createdAt: sortBy };
        const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();
        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext }
    } catch (error: any) {
        throw new Error(`Failed to fetch users ${error.message}`);
    }
}


export async function getActivity(userId: string) {
    try {
        connectToDb();
        const userFlicks = await Flick.find({ author: userId });

        const childFlickId = userFlicks.reduce((acc, userFlick) => {
            return acc.concat(userFlick.children)
        }, [])
        const replies = await Flick.find({
            _id: { $in: childFlickId },
            author: { $ne: userId }
        }).populate({
            path: 'author',
            model: 'User',
            select: 'name image _id'
        }
        )

        return replies;
    }
    catch (error: any) {
        throw new Error(`Failed to fetch Activity ${error.message}`)
    }
}