import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin } from "lucide-react";

const PROFICIENCY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

const PROFICIENCY_VARIANTS: Record<
  string,
  "secondary" | "outline" | "default" | "destructive"
> = {
  BEGINNER: "outline",
  INTERMEDIATE: "secondary",
  ADVANCED: "default",
  EXPERT: "default",
};

interface Provider {
  id: string;
  proficiency: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    location: string | null;
  };
}

interface SkillWithProviders {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  userSkills: Provider[];
}

interface SkillDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { slug } = await params;

  const skill = await prisma.skill.findUnique({
    where: { slug },
    include: {
      userSkills: {
        where: { isOffered: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              location: true,
            },
          },
        },
        orderBy: { proficiency: "desc" },
      },
    },
  });

  if (!skill) {
    notFound();
  }

  const typedSkill = skill as unknown as SkillWithProviders;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/skills"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Skills
      </Link>

      <div className="mb-8">
        <div className="flex items-start gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {typedSkill.name}
          </h1>
          <Badge variant="secondary">{typedSkill.category}</Badge>
        </div>
        {typedSkill.description && (
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {typedSkill.description}
          </p>
        )}
      </div>

      <h2 className="mb-4 text-xl font-semibold">
        Providers ({typedSkill.userSkills.length})
      </h2>

      {typedSkill.userSkills.length === 0 ? (
        <p className="py-8 text-muted-foreground">
          No providers available for this skill yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {typedSkill.userSkills.map((us) => (
            <Card key={us.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={us.user.image ?? ""}
                      alt={us.user.name ?? ""}
                    />
                    <AvatarFallback>
                      {us.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">
                      <Link
                        href={`/profile/${us.user.id}`}
                        className="hover:underline"
                      >
                        {us.user.name ?? "Anonymous"}
                      </Link>
                    </CardTitle>
                    {us.user.location && (
                      <CardDescription className="mt-0.5 flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {us.user.location}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge
                  variant={
                    PROFICIENCY_VARIANTS[us.proficiency] ?? "secondary"
                  }
                >
                  {PROFICIENCY_LABELS[us.proficiency] ?? us.proficiency}
                </Badge>
                <Link
                  href={`/bookings/new?skillId=${typedSkill.id}&providerId=${us.user.id}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  Request Session
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
