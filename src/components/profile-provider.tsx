"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiPath } from "@/lib/routes";

export type Profile = {
  id?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  profilePicture?: string;
  authorUrn?: string;
  connected?: boolean;
};

type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
};

const ProfileContext = createContext<ProfileContextValue>({ profile: null, loading: true });

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (!active) return;
      const cached = localStorage.getItem("mc_linkedin_profile");
      if (!cached) return;
      try {
        const p = JSON.parse(cached);
        setProfile({
          firstName: p.firstName,
          lastName: p.lastName,
          headline: p.headline,
          profilePicture: p.profilePicture,
          authorUrn: p.authorUrn,
          connected: Boolean(p.authorUrn),
        });
        setLoading(false);
      } catch { /* fall through */ }
    });

    fetch(apiPath("/api/profile"))
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.connected) {
          // LinkedIn returns profilePicture as a URN (urn:li:digitalmediaAsset:...)
          // Only use as src if it's an actual HTTP URL, otherwise fall back to initials
          const pic = data.profilePicture || "";
          const isUrl = pic.startsWith("http");
          setProfile({
            firstName: data.firstName,
            lastName: data.lastName,
            headline: data.headline,
            profilePicture: isUrl ? pic : "",
            authorUrn: data.authorUrn,
            connected: true,
          });
          localStorage.setItem("mc_linkedin_profile", JSON.stringify({
            firstName: data.firstName, lastName: data.lastName, headline: data.headline, profilePicture: isUrl ? pic : "", authorUrn: data.authorUrn, connectedAt: Date.now(),
          }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <ProfileContext value={{ profile, loading }}>
      {children}
    </ProfileContext>
  );
}
