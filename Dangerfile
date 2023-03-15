import {message, danger} from "danger"

const modifiedMD = danger.git.modified_files.join("- ")
message("Changed Files in this PR: \n - " + modifiedMD)

# Make it more obvious that a PR is a work in progress and shouldn't be merged yet
warn("PR is classed as Work in Progress") if github.pr_title.include? "[WIP]"

# Fail if release notes are not updated
release_notes_updated = git.modified_files.include? "release_notes.txt"
fail "You forgot to update your release notes file" if !declared_trivial && !release_notes_updated

# Public install page
public_install_page_url = ENV['BITRISE_PUBLIC_INSTALL_PAGE_URL']
message("📱 [New app deployed to Bitrise](#{public_install_page_url})") if public_install_page_url
