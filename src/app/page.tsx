import { getPosts } from "@/actions/post.action";
import { getDbUserByClerkId, getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFOllow from "@/components/WhoToFOllow";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts()
  const dbUserId = await getDbUserId()
  const dbUser= user ? await getDbUserByClerkId(user.id):null

  // console.log({posts})


  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost userImage={dbUser?.image} /> : null}

        <div className="space-y-6">
          {posts.map((post)=>(
            <PostCard key={post.id} post={post} dbUserId={dbUserId}/>
          ))} 
        </div>
      </div>

      <div className=" hidden lg:block lg:col-span-4 sticky top-20">
      <WhoToFOllow/>
      </div>
      
    </div>
  );
}

//TODO:  deploy it.
