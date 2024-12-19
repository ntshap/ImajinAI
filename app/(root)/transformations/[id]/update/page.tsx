import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { getImageById } from "@/lib/actions/image.actions";

interface SearchParamProps {
  params: {
    id: string;
  };
}

type TransformationTypeKey = keyof typeof transformationTypes;

const Page = async ({ params: { id } }: SearchParamProps) => {
  const { userId } = await auth();
  
  if (!userId) redirect("/sign-in");
  
  const user = await getUserById(userId);
  const image = await getImageById(id);

  // Add null check for image
  if (!image) {
    redirect("/"); // or handle the case when image is not found
  }

  // Now TypeScript knows image is not null
  const transformation =
    transformationTypes[image.transformationType as TransformationTypeKey];

  // Add null check for transformation
  if (!transformation) {
    redirect("/"); // or handle invalid transformation type
  }

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />
      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user._id}
          type={image.transformationType as TransformationTypeKey}
          creditBalance={user.creditBalance}
          config={image.config || {}} // Provide default empty object if config is undefined
          data={image}
        />
      </section>
    </>
  );
};

export default Page;