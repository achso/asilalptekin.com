#!/usr/bin/env python3
"""
Download the original source file of a Wistia-hosted video.

Only use this on videos you own or otherwise have the rights to download.

Usage:
    python3 scripts/wistia-download.py <video-id-or-url> [-o output.mp4] [--url-only]

Accepts a bare Wistia media ID (e.g. "tra6gsm6rl"), a wistia.com/medias/<id>
page URL, or a fast.wistia.net/embed/iframe/<id> URL.

Method (per https://gist.github.com/szepeviktor/2a8a3ce8b32e2a67ca416ffd077553c5):
  1. Load the video's iframe embed page.
  2. Find the asset entry with "type":"original" in the embedded JSON.
  3. Take its "url", which points at a .bin file with the original media.
  4. Swap the .bin extension for .mp4 to get a playable download link.
"""

from __future__ import annotations

import argparse
import re
import sys
import urllib.request

WISTIA_ID_RE = re.compile(r"[a-z0-9]{10}", re.IGNORECASE)
ASSET_OBJECT_RE = re.compile(r'\{[^{}]*"type"\s*:\s*"original"[^{}]*\}')
URL_FIELD_RE = re.compile(r'"url"\s*:\s*"([^"]+)"')
USER_AGENT = (
    "Mozilla/5.0 (compatible; wistia-download-script/1.0; "
    "+https://gist.github.com/szepeviktor/2a8a3ce8b32e2a67ca416ffd077553c5)"
)


def extract_video_id(value: str) -> str:
    match = WISTIA_ID_RE.search(value)
    if not match:
        raise ValueError(f"Could not find a Wistia video ID in: {value!r}")
    return match.group(0)


def fetch(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request) as response:
        return response.read().decode("utf-8", errors="replace")


def find_original_url(page_source: str) -> str:
    for obj in ASSET_OBJECT_RE.findall(page_source):
        url_match = URL_FIELD_RE.search(obj)
        if url_match:
            return url_match.group(1)
    raise RuntimeError(
        'Could not find an asset with "type":"original" in the embed page. '
        "The video may be private/password-protected, or Wistia may have "
        "changed its embed format."
    )


def download(url: str, destination: str) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request) as response, open(destination, "wb") as out_file:
        total = response.length or 0
        written = 0
        chunk_size = 1024 * 1024
        while True:
            chunk = response.read(chunk_size)
            if not chunk:
                break
            out_file.write(chunk)
            written += len(chunk)
            if total:
                pct = written * 100 // total
                print(f"\r{destination}: {pct}% ({written}/{total} bytes)", end="", flush=True)
            else:
                print(f"\r{destination}: {written} bytes", end="", flush=True)
    print()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("video", help="Wistia video ID, medias page URL, or embed iframe URL")
    parser.add_argument("-o", "--output", help="Output file path (default: <video-id>.mp4)")
    parser.add_argument(
        "--url-only",
        action="store_true",
        help="Print the resolved .mp4 download URL instead of downloading it",
    )
    args = parser.parse_args()

    video_id = extract_video_id(args.video)
    iframe_url = f"https://fast.wistia.net/embed/iframe/{video_id}"

    print(f"Fetching embed page for video {video_id}...", file=sys.stderr)
    page_source = fetch(iframe_url)

    original_url = find_original_url(page_source)
    mp4_url = re.sub(r"\.bin(\?.*)?$", r".mp4\1", original_url)

    if args.url_only:
        print(mp4_url)
        return 0

    output_path = args.output or f"{video_id}.mp4"
    print(f"Downloading {mp4_url} -> {output_path}", file=sys.stderr)
    download(mp4_url, output_path)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
