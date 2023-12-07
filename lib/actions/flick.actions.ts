"use server"
import { revalidatePath } from "next/cache";
import Flick from "../models/flick.model";
import User from "../models/user.models";
import { connectToDb } from "../mongoose"
import { error } from "console";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

export async function createFlick({ text, author, communityId, path }: Params) {

    try {
        connectToDb();
        const createdflick = await Flick.create({
            text, author, community: null,
        });

        //update usermodel

        await User.findByIdAndUpdate(author, {
            $push: { flicks: createdflick._id }
        })

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Error creating flick: ${error.message}`);
    }

}


export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDb();
    //calculate no of pages to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    //fetch posts with no parents
    const postsQuery = Flick.find({ parentId: { $in: [null, undefined] } }).sort({ createdAt: 'desc' })
        .skip(skipAmount).limit(20).populate({ path: 'author', model: User })
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: 'User',
                select: "_id name parentId image"
            }
        })
    const totalPostsCount = await Flick.countDocuments({
        parentId: { $in: [null, undefined] }
    })
    const posts = await postsQuery.exec();
    const isNext = totalPostsCount > skipAmount + posts.length;
    return { posts, isNext }
}

export async function fetchFlickById(id: string) {
    connectToDb();

    try {
        //multi level comment functionality
        const flick = await Flick.findById(id)
            .populate({
                path: "author",
                model: 'User',
                select: "_id id name image"
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: 'User',
                        select: "_id id name parentId image"
                    },
                    {
                        path: 'children',
                        model: 'Flick',
                        populate: {
                            path: 'author',
                            model: 'User',
                            select: "_id id name parentId image"
                        }
                    }
                ]
            }).exec()
        return flick;


    } catch (error: any) {
        throw new Error(`Error fetching flicks: ${error.message}`);
    }
}


export async function addCommentToFlick(flickId: string, commentText: string, userId: string, path: string) {
    connectToDb();

    try {
        //find the original thread by id
        const originalFlick = await Flick.findById(flickId);
        if (!originalFlick) {
            throw new Error("No such Flick found");
        }


        //add a commment
        const commentFlick = new Flick({
            text: commentText,
            author: userId,
            parentId: flickId,
        });
        const savedCommentFlick = await commentFlick.save();
        originalFlick.children.push(savedCommentFlick._id);

        await originalFlick.save();
        revalidatePath(path);

    } catch (error: any) {
        throw new Error(`Error fetching replies to flick: ${error.message}`)
    }
}