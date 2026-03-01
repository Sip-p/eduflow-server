// models/Course.js — updated, remove lessons array
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['web', 'math', 'science', 'literature', 'language', 'biology', 'other']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnail: { type: String, required: true },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  published: { type: Boolean, default: false },
  studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Derived stats — updated by your APIs, not manually
  totalChapters: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 }, // sum of all lesson durations
  
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
}, { timestamps: true });

CourseSchema.index({ instructor: 1, published: 1 });
CourseSchema.index({ category: 1, price: 1 });
CourseSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Course', CourseSchema);


// /**
//  * Organization Profile Page
//  * 
//  * Public view of an organization's profile.
//  * Server Component - fetches data via RLS.
//  * 
//  * Route: /o/[slug] (slug-id pattern)
//  */

// import { notFound } from 'next/navigation';
// import Link from 'next/link';
// import { getOrganization, getOrganizationBySlug } from '@/lib/services/organizations';
// import { parseOrgSlug } from '@/lib/utils/routing';

// interface PageProps {
//     params: Promise<{ slug: string }>;
// }

// export default async function OrgProfilePage({ params }: PageProps) {
//     const { slug } = await params;
//     const parsed = parseOrgSlug(slug);

//     // Try to find org by ID first (more reliable)
//     // let org = parsed?.id ? await getOrganization(parsed.id) : null;
// let org = null;

// if (parsed?.id) {
//     try {
//         org = await getOrganization(parsed.id);
//     } catch {
//         org = null;
//     }
// }

//     // Fallback to slug lookup
//     if (!org && parsed?.slug) {
//         org = await getOrganizationBySlug(parsed.slug);
//     }

//     if (!org) {
//         notFound();
//     }

//     // Check if org is inactive
//     const isInactive = !org.is_active || org.deleted_at;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-[#FDE9D4] to-[#F5C390]">
//             <div className="max-w-4xl mx-auto px-4 py-12">
//                 {/* Inactive Banner */}
//                 {isInactive && (
//                     <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
//                         <p className="text-yellow-800 font-medium">
//                             This organization is currently inactive.
//                         </p>
//                     </div>
//                 )}

//                 {/* Profile Header */}
//                 <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//                     {/* Cover */}
//                     {org.cover_url && (
//                         <div className="h-48 bg-gradient-to-r from-amber-400 to-orange-400">
//                             <img
//                                 src={org.cover_url}
//                                 alt=""
//                                 className="w-full h-full object-cover"
//                             />
//                         </div>
//                     )}

//                     <div className="p-8">
//                         <div className="flex items-start gap-6">
//                             {/* Logo */}
//                             <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-2xl font-bold text-amber-800 shadow-sm">
//                                 {org.logo_url ? (
//                                     <img
//                                         src={org.logo_url}
//                                         alt={org.name}
//                                         className="w-full h-full rounded-xl object-cover"
//                                     />
//                                 ) : (
//                                     org.name.slice(0, 2).toUpperCase()
//                                 )}
//                             </div>

//                             {/* Info */}
//                             <div className="flex-1">
//                                 <div className="flex items-center gap-2">
//                                     <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
//                                     {org.is_verified && (
//                                         <span className="text-blue-500" title="Verified">
//                                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                                             </svg>
//                                         </span>
//                                     )}
//                                 </div>
//                                 <p className="text-gray-500 mt-1 capitalize">{org.type.replace('_', ' ')}</p>
//                                 {org.location && (
//                                     <p className="text-gray-600 mt-1">{org.location}</p>
//                                 )}
//                             </div>

//                             {/* Actions */}
//                             <div className="flex gap-2">
//                                 <Link
//                                     href={`/o/${org.slug}-${org.id}/manage`}
//                                     className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium hover:bg-amber-200 transition-colors"
//                                 >
//                                     Manage
//                                 </Link>
//                             </div>
//                         </div>

//                         {/* Description */}
//                         {org.description && (
//                             <div className="mt-6 pt-6 border-t border-gray-100">
//                                 <p className="text-gray-700 whitespace-pre-wrap">{org.description}</p>
//                             </div>
//                         )}

//                         {/* Stats */}
//                         <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
//                             {org.established_year && (
//                                 <div>
//                                     <p className="text-2xl font-bold text-gray-900">{org.established_year}</p>
//                                     <p className="text-sm text-gray-500">Established</p>
//                                 </div>
//                             )}
//                             {org.website && (
//                                 <div>
//                                     <a
//                                         href={org.website}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="text-amber-600 hover:underline"
//                                     >
//                                         Visit Website
//                                     </a>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export async function generateMetadata({ params }: PageProps) {
//     const { slug } = await params;
//     const parsed = parseOrgSlug(slug);

//     let org = parsed?.id ? await getOrganization(parsed.id) : null;
//     if (!org && parsed?.slug) {
//         org = await getOrganizationBySlug(parsed.slug);
//     }

//     if (!org) {
//         return { title: 'Organization Not Found' };
//     }

//     return {
//         title: `${org.name} | Kalinga Vriti`,
//         description: org.description?.slice(0, 160) || `View ${org.name} on Kalinga Vriti`,
//     };
// }


// import { notFound } from 'next/navigation';
// import { parseOrgSlug } from '@/lib/utils/routing';
// import { getOrganization, getOrganizationBySlug } from '@/lib/services/organizations';
// import OrgProfileView from '@/app/organisation-module/components/Header';

// interface PageProps {
//   params: { slug: string };
// }

// export default async function Page({ params }: PageProps) {
//   const parsed = parseOrgSlug(params.slug);

//   let org = null;

//   if (parsed?.id) {
//     org = await getOrganization(parsed.id);
//   }

//   if (!org && parsed?.slug) {
//     org = await getOrganizationBySlug(parsed.slug);
//   }

//   if (!org) notFound();

//   return <OrgProfileView org={org} />;
// }


// app/o/[slug]/page.tsx
// app/o/[slug]/page.tsx



// import { redirect } from "next/navigation";

// export default async function OrgOverviewPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;

//   redirect(`/o/${slug}/dashboard`);
// }

// import { notFound, redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
// import PublicOrgPage from "./(public)/(main)/page";

// export default async function OrgOverviewPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;
//   const supabase = await createClient();

//   // 1️⃣ Get org
//   const { data: org } = await supabase
//     .from("organizations")
//     .select("*")
//     .eq("slug", slug)
//     .single();

//  if (!org) {
//   console.log("ORG NULL FOR SLUG:", slug);
//   return <div>Org not found: {slug}</div>;
// }

//   // 2️⃣ Get current user
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     // Not logged in → show public
//     return <PublicOrgPage />;
//   }

//   // 3️⃣ Check membership
//   const { data: membership } = await supabase
//     .from("memberships")
//     .select("id")
//     .eq("org_id", org.id)
//     .eq("user_id", user.id)
//     .maybeSingle();

//   if (membership) {
//     // Member → go to dashboard
//     redirect(`/o/${slug}/dashboard`);
//   }

//   // Not member → show public
//   return <PublicOrgPage />;
// }


// import { notFound, redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";

// export default async function OrgOverviewPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params; // ✅ required in Next 15
//   const supabase = await createClient();

//   // 1️⃣ Fetch organization
//   const { data: org } = await supabase
//     .from("organizations")
//     .select("id")
//     .eq("slug", slug)
//     .single();

//  if (!org) {
//   console.log("ORG NOT FOUND FOR SLUG:", slug);
//   return <div>Org not found: {slug}</div>;
// }

//   // 2️⃣ Get current user
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   // 🔹 If not logged in → show public page
//   if (!user) {
//     return null; // let nested public route render
//   }

//   // 3️⃣ Check membership
//   const { data: membership } = await supabase
//     .from("memberships")
//     .select("id")
//     .eq("org_id", org.id)
//     .eq("user_id", user.id)
//     .maybeSingle();

//   // 🔹 If member → redirect
//   if (membership) {
//     redirect(`/o/${slug}/dashboard`);
//   }

//   // 🔹 Not member → show public page
//   return null;
// }