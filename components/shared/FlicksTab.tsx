import { fetchUserPosts } from "@/lib/actions/users.actions";
import { redirect } from "next/navigation";
import React from "react";
import FlickCard from "../cards/FlickCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const FlicksTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let result: any;
  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }

  if (!result) {
    redirect("/");
  }
  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.flicks.map((flick: any) => (
        <FlickCard
          key={flick._id}
          id={flick._id}
          currentUserId={currentUserId}
          parentId={flick.parentId}
          content={flick.text}
          author={
            accountType === "User"
              ? {
                  name: result.name,
                  image: result.image,
                  id: result.id,
                }
              : {
                  name: flick?.author.name,
                  image: flick?.author.image,
                  id: flick?.author.id,
                }
          }
          community={flick.community} //todo
          createdAt={flick.createdAt}
          comments={flick.children}
        />
      ))}
    </section>
  );
};

export default FlicksTab;
