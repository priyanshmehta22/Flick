"use client";

import React, { ChangeEvent, useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { useOrganization } from "@clerk/nextjs";
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
import { Textarea } from "../ui/textarea";
import { isBase64Image } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { updateUser } from "@/lib/actions/users.actions";
import { flickValidation } from "@/lib/validations/flick";
import { createFlick } from "@/lib/actions/flick.actions";
interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

function PostFlick({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();
  const form = useForm({
    resolver: zodResolver(flickValidation),
    defaultValues: {
      flick: "",
      accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof flickValidation>) => {
    await createFlick({
      text: values.flick,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });
    router.push("/");
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col justify-start mt-10"
      >
        <FormField
          control={form.control}
          name="flick"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2 ">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary-500">
          Post Flick
        </Button>
      </form>
    </Form>
  );
}

export default PostFlick;
