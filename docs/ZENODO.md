# A citable copy of the model (Zenodo)

**Status (Nov 5): version 1.0.0 published by Matthew** (https://zenodo.org/records/23983233, doi:10.5281/zenodo.23983233). The DOI for all versions, used on the site, is **10.5281/zenodo.23983232**.

**Version 1.0.0 mistake:** a test file (test-8mb.bin, 8 MB of random data) went out with 1.0.0. It came from checking the upload size limit: Zenodo reported that upload as failed, and the attempt to delete it didn't take. Version 1.0.1 (https://zenodo.org/records/23983394, doi:10.5281/zenodo.23983394), published by Matthew on Nov 5, has only the archive and a note explaining the change. The all-versions DOI now leads to it. Zenodo support can be asked to remove the test file from 1.0.0 (see below). Lesson: list a draft's files before handing it over.

Earlier: draft created on Zenodo with the archive uploaded (checksum matches), waiting for Matthew to press Publish.** Draft: https://zenodo.org/deposit/23983233 · reserved DOI: 10.5281/zenodo.23983233 (it works once published). Matthew chose option A and agreed to be named as creator.

Earlier status: prepared, not published. Publishing makes a permanent public record that can't be deleted (only new versions can be added), so Matthew decides when.

## What it is

Zenodo (zenodo.org) is a free, permanent research archive run by CERN. Each upload gets a DOI, a permanent link researchers can cite in papers, for example "Borgfeld M. Open Chiari: an open 3D anatomy model of Chiari malformation type I. Zenodo, 2026. doi:10.5281/zenodo.…".

## What goes in it

`node scripts/make-dataset.mjs` builds `dataset/openchiari-dataset-1.0.0.zip` (about 20 MB). It contains only Open Chiari's own work:
- the Simple model (glTF and Blender), the figures and the printable plaques;
- the scripts that build and measure the model, and a fresh measurement check;
- EVIDENCE.md and the audit reports.

Left out:
- the saved copies of other sites' pages, which aren't ours to license;
- the realistic model, which hasn't passed the accuracy checks yet.

The title, description, keywords and license are in `.zenodo.json`. The citation is in `CITATION.cff`, which GitHub also shows as "Cite this repository".

- Creator: Matthew Borgfeld (affiliation: Open Chiari). Matthew can add an ORCID iD if he has one.
- License: CC BY-SA 4.0 for the model, figures and documents; MIT for the scripts.

## How to publish (Matthew)

**Option A (fewest steps for Matthew):**
1. Sign up at zenodo.org; you can sign in with GitHub.
2. Under Applications, make a personal access token with the "deposit:write" and "deposit:actions" boxes ticked.
3. Paste it into the secure form Claude shows you, never into chat.

Claude then uploads the zip and fills in the details as an unpublished draft. You check the draft on Zenodo and press Publish yourself.

**Option B (by hand):**
1. On zenodo.org, choose New upload.
2. Drag in the zip Claude sends you.
3. Copy the title, description and keywords from `.zenodo.json`.
4. Choose "Dataset" and the "CC BY-SA 4.0" license, then press Publish.

## After publishing

Add the DOI to:
- the Open model page;
- `CITATION.cff`;
- `README.md`;
- the introduction pack for the research group.

Each later change to the model goes up as a new version under the same "concept" DOI.

## Notes

- This cloud environment's network stops uploads above about 4 to 8 MB with a "502" error, but the 20 MB archive did arrive complete: Zenodo's checksum matches the local file. Check the checksum before re-uploading.

## Asking Zenodo to remove the stray file from version 1.0.0 (Matthew, optional)

Zenodo's contact form (https://zenodo.org/support), category "File modification":

> Hello. Record https://zenodo.org/records/23983233 (doi:10.5281/zenodo.23983233) contains a file uploaded by mistake, test-8mb.bin (8 MB of random test data, not part of the dataset). Version 1.0.1 already replaces the record without it. Could you remove test-8mb.bin from version 1.0.0? Thank you. Matthew Borgfeld
