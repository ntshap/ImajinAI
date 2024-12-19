"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { useEffect, useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import MediaUploader from "./MediaUploader"
import TransformedImage from "./TransformedImage"
import { updateCredits } from "@/lib/actions/user.actions"
import { getCldImageUrl } from "next-cloudinary"
import { addImage, updateImage } from "@/lib/actions/image.actions"
import { useRouter } from "next/navigation"
import { InsufficientCreditsModal } from "./InsufficientCreditsModal"

interface AddImageParams {
  title: string;
  publicId: string;
  transformationType: string;
  width: number;
  height: number;
  config: object;
  secureURL: string;
  transformationURL?: string;
  aspectRatio?: string;
  prompt?: string;
  color?: string;
}

interface UpdateImageParams extends AddImageParams {
  _id: string;
}

interface TransformationConfig {
  width?: number;
  height?: number;
  prompt?: string;
  color?: string;
  restore?: boolean;
  removeBackground?: boolean;
  fillBackground?: boolean;
  remove?: {
    prompt: string;
    removeShadow: boolean;
    multiple: boolean;
  };
  recolor?: {
    prompt: string;
    to: string;
    multiple: boolean;
  };
  [key: string]: any;
}

interface TransformedImageData {
  title: string;
  publicId: string;
  width: number;
  height: number;
  secureURL: string;
  transformationType: string;
  aspectRatio?: string;
  prompt?: string;
  color?: string;
  _id?: string;
}

interface TransformationFormProps {
  action: string;
  data?: TransformedImageData;
  userId: string;
  type: keyof typeof transformationTypes;
  creditBalance: number;
  config?: TransformationConfig;
}

interface Transformations {
  restore?: TransformationConfig;
  removeBackground?: TransformationConfig;
  recolor?: TransformationConfig;
  [key: string]: TransformationConfig | undefined;
}

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
})

const TransformationForm = ({ 
  action, 
  data, 
  userId, 
  type, 
  creditBalance, 
  config 
}: TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState<TransformedImageData | null>(data || null);
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState<TransformationConfig>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const initialValues = data && action === 'Update' ? {
    title: data?.title,
    aspectRatio: data?.aspectRatio,
    color: data?.color,
    prompt: data?.prompt,
    publicId: data?.publicId,
  } : defaultValues;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });
 
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    if(data || image) {
      const transformationUrl = getCldImageUrl({
        width: image?.width || 0,
        height: image?.height || 0,
        src: image?.publicId || '',
        ...transformationConfig
      });

      const imageData: AddImageParams = {
        title: values.title,
        publicId: image?.publicId || '',
        transformationType: type,
        width: image?.width || 0,
        height: image?.height || 0,
        config: transformationConfig,
        secureURL: image?.secureURL || '',
        transformationURL: transformationUrl,
        aspectRatio: values.aspectRatio || '',
        prompt: values.prompt || '',
        color: values.color || '',
      };

      if(action === 'Add') {
        try {
          const newImage = await addImage({
            image: imageData,
            userId,
            path: '/'
          });

          if(newImage) {
            form.reset();
            setImage(null);
            router.push(`/transformations/${newImage._id}`);
          }
        } catch (error) {
          console.log(error);
        }
      }

      if(action === 'Update' && data?._id) {
        try {
          const updatedImage = await updateImage({
            image: {
              ...imageData,
              _id: data._id,
            },
            userId,
            path: `/transformations/${data._id}`
          });

          if(updatedImage) {
            router.push(`/transformations/${updatedImage._id}`);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    setIsSubmitting(false);
  }

  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];

    setImage((prevState) => prevState ? ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }) : null);

    setNewTransformation(transformationType.config as Transformations);
    return onChangeField(value);
  }

  const onInputChangeHandler = (
    fieldName: string, 
    value: string, 
    type: string, 
    onChangeField: (value: string) => void
  ) => {
    debounce(() => {
      setNewTransformation((prevState) => ({
        ...prevState,
        [type]: {
          ...(prevState?.[type] || {}),
          [fieldName === 'prompt' ? 'prompt' : 'to']: value 
        }
      }));
    }, 1000)();
      
    return onChangeField(value);
  }

  const onTransformHandler = async () => {
    setIsTransforming(true);
    setTransformationConfig(
      deepMergeObjects(newTransformation as TransformationConfig || {}, transformationConfig)
    );

    setNewTransformation(null);

    startTransition(async () => {
      await updateCredits(userId, creditFee);
    });
  }

  useEffect(() => {
    if(image && (type === 'restore' || type === 'removeBackground')) {
      setNewTransformation(transformationType.config as Transformations);
    }
  }, [image, transformationType.config, type]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
        <CustomField 
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />

        {type === 'fill' && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) => onSelectFieldHandler(value, field.onChange)}
                value={field.value}
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem key={key} value={key} className="select-item">
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}  
          />
        )}

        {(type === 'remove' || type === 'recolor') && (
          <div className="prompt-field">
            <CustomField 
              control={form.control}
              name="prompt"
              formLabel={
                type === 'remove' ? 'Object to remove' : 'Object to recolor'
              }
              className="w-full"
              render={({ field }) => (
                <Input 
                  value={field.value || ''}
                  className="input-field"
                  onChange={(e) => onInputChangeHandler(
                    'prompt',
                    e.target.value,
                    type,
                    field.onChange
                  )}
                />
              )}
            />

            {type === 'recolor' && (
              <CustomField 
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input 
                    value={field.value || ''}
                    className="input-field"
                    onChange={(e) => onInputChangeHandler(
                      'color',
                      e.target.value,
                      'recolor',
                      field.onChange
                    )}
                  />
                )}
              />
            )}
          </div>
        )}

        <div className="media-uploader-field">
          <CustomField 
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader 
                onValueChange={(value: string) => field.onChange(value)}
                setImage={(secureURL: string) => setImage({ 
                  secureURL, 
                  publicId: '', // Provide default or actual values for other fields
                  width: 0, 
                  height: 0, 
                  title: '', 
                  transformationType: '' // Removed config as it may not exist in TransformedImageData
                })}
                publicId={field.value || ''}
                image={image?.publicId || ''}
                type={type}
              />
            )}
          />

          <TransformedImage 
            image={image}
            type={type}
            title={form.getValues().title}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            transformationConfig={transformationConfig}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            type="button"
            className="submit-button capitalize"
            disabled={isTransforming || newTransformation === null}
            onClick={onTransformHandler}
          >
            {isTransforming ? 'Transforming...' : 'Apply Transformation'}
          </Button>
          <Button 
            type="submit"
            className="submit-button capitalize"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Save Image'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default TransformationForm