import { useMemo } from "react";

const STOP_WORDS = new Set([
  "the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you","do",
  "at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all",
  "would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make",
  "can","like","time","no","just","him","know","take","people","into","year","your","good","some","could",
  "them","see","other","than","then","now","look","only","come","its","over","think","also","back","after",
  "use","two","how","our","work","first","well","way","even","new","want","because","any","these","give",
  "day","most","us","very","been","has","was","are","is","were","had","did","does","the","really","much",
  "more","great","best","love","using","used","product","been","would","it's","i'm","we've","they're",
  "don't","can't","didn't","won't","i've","that's","what's","here's","there's","let's","he's","she's",
]);

const PALETTE = [
  "hsl(210, 85%, 45%)",
  "hsl(190, 75%, 45%)",
  "hsl(210, 85%, 55%)",
  "hsl(190, 70%, 55%)",
  "hsl(210, 60%, 40%)",
  "hsl(190, 60%, 40%)",
  "hsl(38, 92%, 50%)",
  "hsl(142, 71%, 45%)",
];

interface WordCloudProps {
  testimonials: any[];
}

const WordCloud = ({ testimonials }: WordCloudProps) => {
  const words = useMemo(() => {
    const freq: Record<string, number> = {};
    testimonials.forEach((t) => {
      const text = `${t.title} ${t.content} ${t.review_data?.love || ""}`;
      text
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
        .forEach((w) => {
          freq[w] = (freq[w] || 0) + 1;
        });
    });

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 35)
      .map(([word, count], i) => ({ word, count, color: PALETTE[i % PALETTE.length] }));
  }, [testimonials]);

  if (words.length === 0) return null;

  const maxCount = words[0]?.count || 1;

  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 py-8 px-4">
        {words.map(({ word, count, color }, i) => {
          const size = 0.85 + (count / maxCount) * 1.8;
          const rotation = ((i * 7) % 5) - 2;
          return (
            <span
              key={word}
              className="inline-block font-semibold transition-transform duration-200 hover:scale-125 cursor-default select-none"
              style={{
                fontSize: `${size}rem`,
                color,
                transform: `rotate(${rotation}deg)`,
                opacity: 0.6 + (count / maxCount) * 0.4,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </section>
  );
};

export default WordCloud;
