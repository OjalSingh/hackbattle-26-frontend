"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";

const TRACK_SUBTRACKS_MAP: Record<string, string[]> = {
  "AI / ML": [
    "Computer Vision & Pattern Recognition",
    "Natural Language Processing (NLP)",
    "Generative AI & LLM Applications",
    "Predictive Analytics & Forecasting",
  ],
  Web3: [
    "DeFi (Decentralized Finance)",
    "NFTs & Gaming",
    "DAO & Governance",
    "Smart Contract Infrastructure",
  ],
  Healthcare: [
    "Remote Patient Monitoring",
    "AI Diagnostics",
    "Mental Health & Wellness",
    "Medical Records & Privacy",
  ],
  FinTech: [
    "Micro-investing & Wealthtech",
    "Fraud Detection",
    "Payment Gateway Innovations",
    "Personal Finance Management",
  ],
  OpenInnovation: [
    "General Problem Solving",
    "Social Good & Sustainability",
    "EduTech & E-learning",
  ],
};

function isValidGithubUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());

    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      (url.hostname === "github.com" ||
        url.hostname === "www.github.com")
    );
  } catch {
    return false;
  }
}

export default function Submission() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [track, setTrack] = useState("");
  const [subtrack, setSubtrack] = useState("");
  const [github, setGithub] = useState("");
  const [figma, setFigma] = useState("");
  const [otherLinks, setOtherLinks] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();
  const [loadingProject, setLoadingProject] = useState(true);

  // Get dynamic subtrack options according to selected track
  const availableSubtracks = useMemo(() => {
    return TRACK_SUBTRACKS_MAP[track] || [];
  }, [track]);

  const handleTrackChange = (selectedTrack: string) => {
    setTrack(selectedTrack);
    setSubtrack(""); // Reset subtrack when main track changes
    setSubmitted(false);
  };

  useEffect(() => {
  const loadExistingSubmission = async () => {
    setLoadingProject(true);

    try {
      const { data, status } = await api.getTeam();

      if (status === 200 && data) {
        // These fields already exist in the current backend.
        setDescription(data.problem_stmt || "");
        setGithub(data.github_link || "");
        setFigma(data.figma_link || "");
        setOtherLinks(data.other_files || "");

        // These are NOT currently returned by the old backend,
        // so leave them for the user to enter manually.
        setProjectName("");
        setTrack("");
        setSubtrack("");

        // If at least one persisted submission field exists,
        // consider the form to contain an existing submission.
        const hasExistingSubmission =
          Boolean(data.problem_stmt) ||
          Boolean(data.github_link) ||
          Boolean(data.figma_link) ||
          Boolean(data.other_files);

        setSubmitted(hasExistingSubmission);
      } else if (status === 204 || status === 403 || status === 404) {
        setSubmitted(false);
      } else if (status === 401) {
        toast({
          title: "LOGIN REQUIRED",
          description: "Please login to access your submission.",
        });
      }
    } catch (error) {
      console.error("Failed to load existing submission:", error);
    } finally {
      setLoadingProject(false);
    }
  };

  loadExistingSubmission();
}, [toast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const trimmedProjectName = projectName.trim();
  const trimmedDescription = description.trim();
  const trimmedGithub = github.trim();
  const trimmedFigma = figma.trim();
  const trimmedOtherLinks = otherLinks.trim();

  if (!trimmedProjectName) {
    showToast("Project Name is required.", "error");
    return;
  }

  if (!trimmedDescription) {
    showToast("Project Description is required.", "error");
    return;
  }

  if (!track) {
    showToast("Please select a Track.", "error");
    return;
  }

  if (!subtrack) {
    showToast("Please select a Subtrack.", "error");
    return;
  }

  if (!trimmedGithub) {
    showToast("GitHub Link is required.", "error");
    return;
  }

  if (!isValidGithubUrl(trimmedGithub)) {
    showToast("Please enter a valid GitHub link.", "error");
    return;
  }

  try {
    setSubmitted(false);

    const { data, status } = await api.submitProject({
  project_name: trimmedProjectName,
  problem_stmt: trimmedDescription,
  track: track.trim(),
  subtrack: subtrack.trim(),
  github_link: trimmedGithub,
  figma_link: trimmedFigma,
  other_files: trimmedOtherLinks,
});

    if (status === 200 || status === 201) {
      setSubmitted(true);
      showToast(
        "Project submitted successfully!",
        "success"
      );
      return;
    }

    if (status === 400) {
      showToast(
        data?.message || "Please check your submission details.",
        "error"
      );
      return;
    }

    if (status === 401) {
      showToast("Please log in before submitting.", "error");
      return;
    }

    if (status === 403) {
      showToast(
        "Only the team leader can submit the project.",
        "error"
      );
      return;
    }

    if (status === 404) {
      showToast("Team not found.", "error");
      return;
    }

    throw new Error(
      data?.message || `Submission failed (${status})`
    );
  } catch (error) {
    console.error("Submission error:", error);

    showToast(
      error instanceof Error
        ? error.message
        : "Failed to submit project. Please try again.",
      "error"
    );
  }
}

  return (
    <main className="w-full min-h-screen bg-black p-0">
      <section
        className="
          relative
          mx-auto
          w-full
          min-h-screen
          overflow-hidden
          bg-black

          md:aspect-[1305/734]
          md:min-h-0
        "
      >
        {/* BACKGROUND VIDEO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="
            absolute
            inset-0
            z-0
            h-full
            w-full
            object-cover
            object-center
          "
        >
          <source
            src="/submission/video/pikachu_motion.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 z-[1] bg-white/[0.06]" />

        {/* LOGOS */}
        <img
          src="/submission/HTML UI/IEEE_CS_logo.svg"
          alt="IEEE Computer Society"
          className="
            absolute
            left-[4%]
            top-[2.5%]
            z-20
            h-auto
            w-[22%]
            max-w-[115px]

            md:left-[3%]
            md:top-[3%]
            md:w-[12%]
            md:max-w-[160px]
          "
        />

        <img
          src="/submission/HTML UI/HACKBATTLE.svg"
          alt="HackBattle"
          className="
            absolute
            right-[4%]
            top-[2.5%]
            z-20
            h-auto
            w-[12%]
            max-w-[65px]

            md:right-[3%]
            md:top-[3%]
            md:w-[8%]
            md:max-w-[105px]
          "
        />
        <Link
          href="/team"
          className="
            absolute
            z-30
            rounded-full
            bg-[#397b68]
            px-6
            py-3
            font-pixeboy
            text-xl
            text-white
            transition
            hover:scale-105

            /* Desktop */
            right-[5%]
            top-[17%]

            /* Mobile */
            max-md:left-1/2
            max-md:right-auto
            max-md:top-[94%]
            max-md:-translate-x-1/2
            max-md:px-5
            max-md:py-2
            max-md:text-base
            max-md:whitespace-nowrap
        "
      >
        GO TO TEAM PAGE
</Link>
        {/* FORM */}
        <form onSubmit={handleSubmit} className="absolute inset-0 z-10">
          {/* TITLE */}
          <h1
            className="
              absolute
              left-[7%]
              top-[5%]
              whitespace-nowrap
              font-pixeboy
              text-[clamp(3.5rem,14vw,5rem)]
              leading-none
              tracking-wide
              text-[#f4c51e]
              [-webkit-text-stroke:3px_#111]
              drop-shadow-[4px_4px_0_#111]

              md:left-[5%]
              md:top-[8%]
              md:text-[clamp(4rem,7vw,7.5rem)]
              md:[-webkit-text-stroke:4px_#111]
              md:drop-shadow-[5px_5px_0_#111]
            "
          >
            SUBMISSION
          </h1>

          {/* DESKTOP DIVIDER */}
          <div
            className="
              absolute
              left-[52%]
              top-[17%]
              hidden
              h-[76%]
              w-[3px]
              -translate-x-1/2
              bg-black

              md:block
            "
          />

          {/* PROJECT NAME */}
          <div
            className="
              absolute
              left-[8%]
              top-[15%]
              w-[84%]

              md:left-[7%]
              md:top-[22%]
              md:w-[44%]
            "
          >
            <label
              htmlFor="project-name"
              className="
                block
                font-pixeboy
                text-[clamp(1rem,3.8vw,1.3rem)]
                leading-none
                text-black

                md:text-[clamp(1.5rem,2.2vw,2.5rem)]
              "
            >
              PROJECT NAME
            </label>

            <input
              id="project-name"
              value={projectName}
              required
              maxLength={100}
              onChange={(e) => {
                setProjectName(e.target.value);
                setSubmitted(false);
              }}
              className="
                mt-[1%]
                h-[38px]
                w-full
                border-[3px]
                border-black
                bg-white/20
                px-3
                font-pixeboy
                text-[1rem]
                text-black
                outline-none
                focus:bg-white/40

                md:mt-[1%]
                md:h-[clamp(40px,3vw,52px)]
                md:border-[4px]
                md:px-5
                md:text-[clamp(1.1rem,1.4vw,1.6rem)]
              "
            />
          </div>

          {/* PROJECT DESCRIPTION */}
          <div
            className="
              absolute
              left-[8%]
              top-[25%]
              w-[84%]

              md:left-[7%]
              md:top-[38%]
              md:w-[44%]
            "
          >
            <label
              htmlFor="project-description"
              className="
                block
                font-pixeboy
                text-[clamp(1rem,3.8vw,1.3rem)]
                leading-none
                text-black

                md:text-[clamp(1.5rem,2.2vw,2.5rem)]
              "
            >
              PROJECT DESCRIPTION
            </label>

            <textarea
              id="project-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSubmitted(false);
              }}
              className="
                mt-[1%]
                h-[85px]
                w-full
                resize-none
                border-[3px]
                border-black
                bg-white/20
                px-3
                py-2
                font-pixeboy
                text-[0.95rem]
                leading-tight
                text-black
                outline-none
                focus:bg-white/40

                md:mt-[1%]
                md:h-[clamp(115px,11vw,150px)]
                md:border-[4px]
                md:px-5
                md:py-3
                md:text-[clamp(1rem,1.3vw,1.5rem)]
              "
            />
          </div>

          {/* TRACK */}
          <div
            className="
              absolute
              left-[8%]
              top-[40%]
              w-[84%]

              md:left-[7%]
              md:top-[64%]
              md:w-[44%]
            "
          >
            <label
              htmlFor="track"
              className="
                block
                font-pixeboy
                text-[clamp(1rem,3.8vw,1.3rem)]
                leading-none
                text-black

                md:text-[clamp(1.5rem,2.2vw,2.5rem)]
              "
            >
              TRACK
            </label>

            <select
              id="track"
              value={track}
              required
              onChange={(e) => handleTrackChange(e.target.value)}
              className="
                mt-[1%]
                h-[38px]
                w-full
                border-[3px]
                border-black
                bg-white/20
                px-3
                font-pixeboy
                text-[0.95rem]
                text-black
                outline-none
                focus:bg-white/40

                md:mt-[1%]
                md:h-[clamp(40px,3vw,52px)]
                md:border-[4px]
                md:px-5
                md:text-[clamp(1rem,1.3vw,1.5rem)]
              "
            >
              <option value="" disabled className="bg-white text-black">
                SELECT TRACK
              </option>
              {Object.keys(TRACK_SUBTRACKS_MAP).map((t) => (
                <option key={t} value={t} className="bg-white text-black">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* SUBTRACK */}
          <div
            className="
              absolute
              left-[8%]
              top-[50%]
              w-[84%]

              md:left-[7%]
              md:top-[79%]
              md:w-[44%]
            "
          >
            <label
              htmlFor="subtrack"
              className="
                block
                font-pixeboy
                text-[clamp(1rem,3.8vw,1.3rem)]
                leading-none
                text-black

                md:text-[clamp(1.5rem,2.2vw,2.5rem)]
              "
            >
              SUBTRACK
            </label>

            <select
              id="subtrack"
              required
              value={subtrack}
              disabled={availableSubtracks.length === 0}
              onChange={(e) => {
                setSubtrack(e.target.value);
                setSubmitted(false);
              }}
              className="
                mt-[1%]
                h-[38px]
                w-full
                border-[3px]
                border-black
                bg-white/20
                px-3
                font-pixeboy
                text-[0.95rem]
                text-black
                outline-none
                focus:bg-white/40
                disabled:opacity-50

                md:mt-[1%]
                md:h-[clamp(40px,3vw,52px)]
                md:border-[4px]
                md:px-5
                md:text-[clamp(1rem,1.3vw,1.5rem)]
              "
            >
              <option value="" disabled className="bg-white text-black">
                {track ? "SELECT SUBTRACK" : "SELECT A TRACK FIRST"}
              </option>
              {availableSubtracks.map((st) => (
                <option key={st} value={st} className="bg-white text-black">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* GITHUB LINK */}
          <div
            className="
              absolute
              left-[8%]
              top-[60%]
              w-[84%]

              md:left-[53.5%]
              md:top-[22%]
              md:w-[39%]
            "
          >
            <label
              htmlFor="github"
              className="
                block
                font-pixeboy
                text-[clamp(1rem,3.8vw,1.3rem)]
                leading-none
                text-black

                md:text-[clamp(1.5rem,2.2vw,2.5rem)]
              "
            >
              GITHUB LINK
            </label>

            <input
              id="github"
              type="url"
              value={github}
              required
              onChange={(e) => setGithub(e.target.value)}
              placeholder="ENTER YOUR GITHUB LINK"
              className="
                mt-[1%]
                h-[36px]
                w-full
                border-[3px]
                border-black
                bg-white/20
                px-3
                font-pixeboy
                text-[0.8rem]
                text-black
                placeholder:text-black
                focus:placeholder-transparent
                outline-none
                focus:bg-white/40

                md:mt-[1%]
                md:h-[clamp(38px,2.8vw,48px)]
                md:border-[4px]
                md:px-5
                md:text-[clamp(0.9rem,1.1vw,1.2rem)]
              "
            />
          </div>

          {/* FIGMA LINK */}
          <div
            className="
              absolute
              left-[8%]
              top-[69%]
              w-[84%]

              md:left-[53.5%]
              md:top-[36%]
              md:w-[39%]
            "
          >
            <label
              htmlFor="figma"
              className="
                block
                font-pixeboy
                text-[clamp(1rem,3.8vw,1.3rem)]
                leading-none
                text-black

                md:text-[clamp(1.5rem,2.2vw,2.5rem)]
              "
            >
              FIGMA LINK
            </label>

            <input
              id="figma"
              type="url"
              value={figma}
              onChange={(e) => setFigma(e.target.value)}
              placeholder="ENTER YOUR FIGMA LINK"
              className="
                mt-[1%]
                h-[36px]
                w-full
                border-[3px]
                border-black
                bg-white/20
                px-3
                font-pixeboy
                text-[0.8rem]
                text-black
                placeholder:text-black
                focus:placeholder-transparent
                outline-none
                focus:bg-white/40

                md:mt-[1%]
                md:h-[clamp(38px,2.8vw,48px)]
                md:border-[4px]
                md:px-5
                md:text-[clamp(0.9rem,1.1vw,1.2rem)]
              "
            />
          </div>

          {/* OTHER LINKS */}
          <div
            className="
              absolute
              left-[8%]
              top-[78%]
              w-[84%]

              md:left-[53.5%]
              md:top-[50%]
              md:w-[39%]
            "
          >
            <label
              htmlFor="other-links"
              className="
                block
                font-pixeboy
                text-[clamp(1rem,3.8vw,1.3rem)]
                leading-none
                text-black

                md:text-[clamp(1.5rem,2.2vw,2.5rem)]
              "
            >
              OTHER LINKS
            </label>

            <input
              id="other-links"
              type="url"
              value={otherLinks}
              onChange={(e) => setOtherLinks(e.target.value)}
              placeholder="ENTER ANY OTHER LINK"
              className="
                mt-[1%]
                h-[36px]
                w-full
                border-[3px]
                border-black
                bg-white/20
                px-3
                font-pixeboy
                text-[0.8rem]
                text-black
                placeholder:text-black
                focus:placeholder-transparent
                outline-none
                focus:bg-white/40

                md:mt-[1%]
                md:h-[clamp(38px,2.8vw,48px)]
                md:border-[4px]
                md:px-5
                md:text-[clamp(0.9rem,1.1vw,1.2rem)]
              "
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="
              absolute
              left-[50%]
              top-[89%]
              w-[32%]
              -translate-x-1/2
              rounded-full
              bg-[#397b68]
              py-[1.5%]
              font-pixeboy
              text-[1rem]
              text-white
              transition
              hover:scale-[1.03]
              hover:bg-[#316b5b]
              active:scale-[0.98]

              md:left-[67%]
              md:top-[65%]
              md:w-[13%]
              md:translate-x-0
              md:py-[0.8%]
              md:text-[clamp(1rem,1.3vw,1.5rem)]
            "
          >
            SUBMIT
          </button>

          {/* SUCCESS MESSAGE */}
          {submitted && (
            <div
              className="
                absolute
                bottom-[1.5%]
                left-[50%]
                -translate-x-1/2
                font-pixeboy
                text-[0.9rem]
                text-green-900

                md:bottom-[3%]
                md:left-auto
                md:right-[3%]
                md:translate-x-0
                md:text-[clamp(0.9rem,1.1vw,1.3rem)]
              "
            >
              SUBMISSION SAVED
            </div>
          )}
        </form>
      </section>
    </main>
  );
}