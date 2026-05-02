import { PostEditor } from "@/components/post-editor";
import { LLMSetupBanner } from "@/components/llm-status";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nouveau post</h1>
      <LLMSetupBanner />
      <div className="mt-4">
        <PostEditor />
      </div>
    </div>
  );
}
