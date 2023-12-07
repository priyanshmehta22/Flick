"use client";
import React, { ChangeEvent, useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { useUploadThing } from "@/lib/uploadThing";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import Image from "next/image";
import { Input } from "../ui/input";
import { isBase64Image } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
// import { updateUser } from "@/lib/actions/users.actions";
import { commentValidation } from "@/lib/validations/flick";
import { addCommentToFlick } from "@/lib/actions/flick.actions";
// import { createFlick } from "@/lib/actions/flick.actions";

interface Props {
  flickId: string;
  currentUserImg: string;
  currentUserId: string;
}

const Comment = ({ flickId, currentUserImg, currentUserId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(commentValidation),
    defaultValues: {
      flick: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof commentValidation>) => {
    await addCommentToFlick(
      flickId,
      values.flick,
      JSON.parse(currentUserId),
      pathname
    );
    form.reset();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
        <FormField
          control={form.control}
          name="flick"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 w-full">
              <FormLabel>
                <Image
                  src={currentUserImg}
                  alt="profile photo"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                  type="text"
                  placeholder="Comment..."
                  className="no-focus text-light-1 outline-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="comment-form_btn">
          Reply
        </Button>
      </form>
    </Form>
  );
};

export default Comment;
