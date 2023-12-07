"use server";

import { revalidatePath } from "next/cache";

import { connectToDb } from "../mongoose";

import User from "../models/user.models";
import Flick from "../models/flick.model";
import Community from "../models/community.model";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDb();

    // Calculate the number of posts to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
    const postsQuery = Flick.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({
            path: "author",
            model: User,
        })
        .populate({
            path: "community",
            model: Community,
        })
        .populate({
            path: "children", // Populate the children field
            populate: {
                path: "author", // Populate the author field within children
                model: User,
                select: "_id name parentId image", // Select only _id and username fields of the author
            },
        });

    // Count the total number of top-level posts (threads) i.e., threads that are not comments.
    const totalPostsCount = await Flick.countDocuments({
        parentId: { $in: [null, undefined] },
    }); // Get the total count of posts

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
}

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createFlick({ text, author, communityId, path }: Params
) {
    try {
        connectToDb();

        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );

        const createdFlick = await Flick.create({
            text,
            author,
            community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
        });

        // Update User model
        await User.findByIdAndUpdate(author, {
            $push: { flicks: createdFlick._id },
        });

        if (communityIdObject) {
            // Update Community model
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: { flicks: createdFlick._id },
            });
        }

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to create flick: ${error.message}`);
    }
}

async function fetchAllChildFlicks(flickId: string): Promise<any[]> {
    const childFlicks = await Flick.find({ parentId: flickId });

    const descendantFlicks = [];
    for (const childFlick of childFlicks) {
        const descendants = await fetchAllChildFlicks(childFlick._id);
        descendantFlicks.push(childFlick, ...descendants);
    }

    return descendantFlicks;
}

export async function deleteFlick(id: string, path: string): Promise<void> {
    try {
        connectToDb();

        // Find the thread to be deleted (the main thread)
        const mainFlick = await Flick.findById(id).populate("author community");

        if (!mainFlick) {
            throw new Error("Flick not found");
        }

        // Fetch all child threads and their descendants recursively
        const descendantFlicks = await fetchAllChildFlicks(id);

        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantFlickIds = [
            id,
            ...descendantFlicks.map((flick) => flick._id),
        ];

        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
            [
                ...descendantFlicks.map((flick) => flick.author?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainFlick.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
            [
                ...descendantFlicks.map((flick) => flick.community?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainFlick.community?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        // Recursively delete child threads and their descendants
        await Flick.deleteMany({ _id: { $in: descendantFlicks } });

        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { flicks: { $in: descendantFlickIds } } }
        );

        // Update Community model
        await Community.updateMany(
            { _id: { $in: Array.from(uniqueCommunityIds) } },
            { $pull: { flicks: { $in: descendantFlickIds } } }
        );

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to delete flick: ${error.message}`);
    }
}

export async function fetchFlickById(flickId: string) {
    connectToDb();

    try {
        const flick = await Flick.findById(flickId)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image",
            }) // Populate the author field with _id and username
            .populate({
                path: "community",
                model: Community,
                select: "_id id name image",
            }) // Populate the community field with _id and name
            .populate({
                path: "children", // Populate the children field
                populate: [
                    {
                        path: "author", // Populate the author field within children
                        model: User,
                        select: "_id id name parentId image", // Select only _id and username fields of the author
                    },
                    {
                        path: "children", // Populate the children field within children
                        model: Flick, // The model of the nested children (assuming it's the same "Thread" model)
                        populate: {
                            path: "author", // Populate the author field within nested children
                            model: User,
                            select: "_id id name parentId image", // Select only _id and username fields of the author
                        },
                    },
                ],
            })
            .exec();

        return flick;
    } catch (err) {
        // console.error("Error while fetching flick:", err);
        throw new Error("Unable to fetch flick");
    }
}

export async function addCommentToFlick(
    flickId: string,
    commentText: string,
    userId: string,
    path: string
) {
    connectToDb();

    try {
        // Find the original thread by its ID
        const originalFlick = await Flick.findById(flickId);

        if (!originalFlick) {
            throw new Error("Flick not found");
        }

        // Create the new comment thread
        const commentFlick = new Flick({
            text: commentText,
            author: userId,
            parentId: flickId, // Set the parentId to the original thread's ID
        });

        // Save the comment thread to the database
        const savedCommentFlick = await commentFlick.save();

        // Add the comment thread's ID to the original thread's children array
        originalFlick.children.push(savedCommentFlick._id);

        // Save the updated original thread to the database
        await originalFlick.save();

        revalidatePath(path);
    } catch (err) {
        console.error("Error while adding comment:", err);
        throw new Error("Unable to add comment");
    }
}