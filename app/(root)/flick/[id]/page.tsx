import FlickCard from "@/components/cards/FlickCard";
import Comment from "@/components/forms/Comment";
import { fetchFlickById } from "@/lib/actions/flick.actions";
import { fetchUser } from "@/lib/actions/users.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  const flick = await fetchFlickById(params.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  return (
    <section className="relative ">
      <div>
        <FlickCard
          key={flick._id}
          id={flick._id}
          currentUserId={user?.id || ""}
          parentId={flick.parentId}
          content={flick.text}
          author={flick.author}
          community={flick.community}
          createdAt={flick.createdAt}
          comments={flick.children}
        />
      </div>
      <div className="mt-7">
        <Comment
          flickId={flick.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className="mt-10">
        {flick.children.map((childItem: any) => (
          <FlickCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={childItem?.id || ""}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
};

export default Page;
