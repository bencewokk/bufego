#!/usr/bin/env python3
import argparse
import os
import subprocess
import sys

def validate_repo(repo_path):
    """Validate that the given path is a Git repository."""
    if not os.path.isdir(repo_path):
        print(f"Error: Repository path '{repo_path}' does not exist or is not a directory.")
        return False
    
    git_dir = os.path.join(repo_path, ".git")
    if not os.path.isdir(git_dir):
        print(f"Error: '{repo_path}' is not a Git repository (no .git directory found).")
        return False
    
    return True

def validate_commits(repo_path, commit_hashes):
    """Validate that all commit hashes exist in the repository."""
    invalid_commits = []
    
    for commit in commit_hashes:
        try:
            # Check if commit exists
            result = subprocess.run(
                ["git", "cat-file", "-e", f"{commit}^{{commit}}"],
                cwd=repo_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False
            )
            if result.returncode != 0:
                invalid_commits.append(commit)
        except Exception as e:
            print(f"Error checking commit {commit}: {e}")
            invalid_commits.append(commit)
    
    if invalid_commits:
        print("The following commits were not found in the repository:")
        for commit in invalid_commits:
            print(f"  - {commit}")
        return False
    
    return True

def get_current_branch(repo_path):
    """Get the name of the current branch."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=repo_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
            text=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error getting current branch: {e}")
        print(f"stderr: {e.stderr}")
        return None

def check_clean_working_tree(repo_path):
    """Check if the working tree is clean."""
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=repo_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
            text=True
        )
        return result.stdout.strip() == ""
    except subprocess.CalledProcessError as e:
        print(f"Error checking git status: {e}")
        print(f"stderr: {e.stderr}")
        return False

def remove_commits(repo_path, commit_hashes, backup_branch=None, force=False):
    """Remove the specified commits from the Git repository."""
    current_branch = get_current_branch(repo_path)
    if not current_branch:
        return False
    
    if current_branch == "HEAD":
        print("Currently in detached HEAD state. Please checkout a branch before removing commits.")
        return False
    
    # Check if we have a clean working tree
    if not check_clean_working_tree(repo_path) and not force:
        print("Error: Working tree has uncommitted changes. Commit or stash your changes first.")
        print("Use --force to proceed anyway (may lose uncommitted changes).")
        return False
    
    # Create backup branch if requested
    if backup_branch:
        try:
            subprocess.run(
                ["git", "branch", backup_branch],
                cwd=repo_path,
                check=True
            )
            print(f"Created backup branch: {backup_branch}")
        except subprocess.CalledProcessError as e:
            print(f"Error creating backup branch: {e}")
            return False
    
    # Create a list of all commit ids to remove
    commits_to_remove = set(commit_hashes)
    
    # Build a list of commits to keep (excluding those we want to remove)
    try:
        print("Analyzing repository history...")
        result = subprocess.run(
            ["git", "log", "--format=%H"],
            cwd=repo_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
            text=True
        )
        all_commits = result.stdout.strip().split('\n')
        commits_to_keep = [c for c in all_commits if c not in commits_to_remove]
        
        if not commits_to_keep:
            print("Error: Cannot remove all commits from history!")
            return False
        
        # Use git filter-branch to rewrite history
        print(f"Removing {len(commits_to_remove)} commits from history...")
        filter_cmd = ["git", "filter-branch", "--force", "--commit-filter"]
        
        # Build the commit filter command
        filter_script = (
            'if [ $(git rev-parse "$GIT_COMMIT") = "$1" ]'
        )
        
        # Add each commit we want to remove to the filter script
        for i, commit in enumerate(commits_to_remove):
            if i == 0:
                filter_script += f' || [ $(git rev-parse "$GIT_COMMIT") = "{commit}" ]'
            else:
                filter_script += f' || [ $(git rev-parse "$GIT_COMMIT") = "{commit}" ]'
        
        filter_script += '; then skip_commit "$@"; else git commit-tree "$@"; fi'
        
        first_commit = commits_to_keep[-1]  # The oldest commit to keep
        filter_cmd.append(filter_script)
        filter_cmd.append(f"{current_branch}^..")
        
        subprocess.run(
            filter_cmd,
            cwd=repo_path,
            check=True
        )
        
        print("Commits successfully removed!")
        print("\nNote: The old history is still available in the .git/refs/original/ directory.")
        print("To completely remove it, you can run:")
        print(f"  cd {repo_path} && git for-each-ref --format=\"%(refname)\" refs/original/ | xargs -n 1 git update-ref -d")
        print("  cd {repo_path} && git reflog expire --expire=now --all && git gc --prune=now --aggressive")
        print("\nIMPORTANT: If this is a shared repository, you'll need to force push your changes:")
        print(f"  cd {repo_path} && git push --force")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error removing commits: {e}")
        print(f"stderr: {e.stderr}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Remove specific commits from a Git repository's history.")
    parser.add_argument("repo_path", help="Path to the Git repository")
    parser.add_argument("--commits", "-c", required=True, 
                        help="Comma-separated list of commit hashes to remove, or path to a file containing one commit hash per line")
    parser.add_argument("--backup", "-b", help="Create a backup branch before removing commits")
    parser.add_argument("--force", "-f", action="store_true", help="Force operation even with uncommitted changes")
    
    args = parser.parse_args()
    
    # Validate repository path
    if not validate_repo(args.repo_path):
        return 1
    
    # Parse commit hashes
    commit_hashes = []
    if os.path.isfile(args.commits):
        # Read commits from file
        with open(args.commits, 'r') as f:
            commit_hashes = [line.strip() for line in f if line.strip()]
    else:
        # Parse commits from command line
        commit_hashes = [c.strip() for c in args.commits.split(',') if c.strip()]
    
    if not commit_hashes:
        print("Error: No commit hashes provided.")
        return 1
    
    # Validate commit hashes
    if not validate_commits(args.repo_path, commit_hashes):
        return 1
    
    # Remove commits
    if remove_commits(args.repo_path, commit_hashes, args.backup, args.force):
        return 0
    else:
        return 1

if __name__ == "__main__":
    sys.exit(main())