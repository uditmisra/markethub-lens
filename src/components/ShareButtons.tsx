import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Facebook, Mail, Link2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

const ShareButtons = ({ url, title, description }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\n${url}`)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareUrls.twitter, "_blank")}
      >
        <Twitter className="h-4 w-4 mr-2" />
        Twitter
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareUrls.linkedin, "_blank")}
      >
        <Linkedin className="h-4 w-4 mr-2" />
        LinkedIn
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareUrls.facebook, "_blank")}
      >
        <Facebook className="h-4 w-4 mr-2" />
        Facebook
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareUrls.email, "_blank")}
      >
        <Mail className="h-4 w-4 mr-2" />
        Email
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </>
        )}
      </Button>
    </div>
  );
};

export default ShareButtons;
