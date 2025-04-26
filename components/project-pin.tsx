"use client"
import { PinContainer } from "@/components/ui/3d-pin"
import Image from "next/image"

type ProjectPinProps = {
  title: string
  description: string
  href: string
  image?: string
}

export default function ProjectPin({ title, description, href, image = "/placeholder.svg" }: ProjectPinProps) {
  return (
    <div className="h-[30rem] w-full flex items-center justify-center">
      <PinContainer title={title} href={href}>
        <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem]">
          <h3 className="max-w-xs !pb-2 !m-0 font-bold text-base text-black dark:text-white">{title}</h3>
          <div className="text-base !m-0 !p-0 font-normal">
            <span className="text-gray-500 dark:text-gray-400">{description}</span>
          </div>
          <div className="flex flex-1 w-full rounded-lg mt-4 overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              width={400}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </PinContainer>
    </div>
  )
}
