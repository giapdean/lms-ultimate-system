import os
import json
import subprocess
import sys

# Paths
BASE_DIR = os.getcwd()
ACCOUNT_FILE = os.path.join(BASE_DIR, 'Account')
CLASP_JSON = os.path.join(BASE_DIR, 'deploy_gas', '.clasp.json')

def load_account_config():
    config = {}
    if os.path.exists(ACCOUNT_FILE):
        with open(ACCOUNT_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    config[key.strip()] = value.strip()
    return config

def run_command(command, cwd=None, ignore_error=False):
    try:
        subprocess.run(command, check=True, shell=True, cwd=cwd)
        return True
    except subprocess.CalledProcessError as e:
        if not ignore_error:
            print(f"Error running command: {command}\n{e}")
        return False

def deploy_gas(script_id):
    print("\n[Backend] Deploying to Google Apps Script...")
    
    # 1. Sync Backend
    print("  - Syncing code.gs -> deploy_gas/Code.js")
    run_command('copy /Y code.gs deploy_gas\\Code.js')
    print("  - Syncing index.html -> deploy_gas/index.html")
    run_command('copy /Y index.html deploy_gas\\index.html')
    
    # 2. Clasp Push
    print(f"  - Pushing to Script ID: {script_id}")
    deploy_dir = os.path.join(BASE_DIR, 'deploy_gas')
    
    # Ensure clasp json has correct ID (re-using logic from setup if needed, but assuming setup run or we do it here)
    # Let's just update it to be safe
    if os.path.exists(CLASP_JSON):
        with open(CLASP_JSON, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if data.get('scriptId') != script_id:
            data['scriptId'] = script_id
            with open(CLASP_JSON, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
    
    run_command('clasp push -f', cwd=deploy_dir)

    # 3. Create Version & Update Deployment
    print("  - Creating new version...")
    # Capture output to get version number if needed, but for now just create it
    run_command('clasp version "Auto-deploy"', cwd=deploy_dir)
    
    print("  - Updating Web App Deployment...")
    # Deployment ID provided by user: AKfycbwW...
    deployment_id = "AKfycbwWd1bGqoXLlMmqBfpYpVtYw7jJauE6-bNPxeKEPySXm99Jh_GmVsaImNQzxmEzj7Y4"
    # We need to get the latest version number to deploy, 
    # but 'clasp deploy' without version might deploy @HEAD or latest? 
    # Actually 'clasp deploy -i <id>' needs -V <version>. 
    # Let's try to just use 'clasp deploy' which might create a NEW deployment if not careful.
    # SAFE STRATEGY: Update the script to fetch latest version and update specific deployment.
    
    # For now, let's just create the version. The user might need to manually update deployment 
    # OR we try to run the update command blindly with the 'latest' concept if clasp supports it.
    # Clasp doesn't easily support "deploy latest version to existing ID" in one command without parsing.
    # Let's parse the version.
    
    # Parse versions to find the latest
    try:
        # Get list of versions
        result = subprocess.run('clasp versions', shell=True, cwd=deploy_dir, capture_output=True, text=True)
        # Output format usually:
        # ...
        # 30 - Fix
        # 31 - Auto-deploy
        
        lines = result.stdout.strip().split('\n')
        latest_version = None
        
        for line in reversed(lines):
            parts = line.strip().split(' - ')
            if parts and parts[0].isdigit():
                latest_version = parts[0]
                break
        
        if latest_version:
             print(f"  - Deploying and Activating Version {latest_version} to Deployment ID {deployment_id}...")
             run_command(f'clasp deploy -i {deployment_id} -V {latest_version}', cwd=deploy_dir)
             print(f"  - Deployment Updated: {deployment_id} -> Version {latest_version}")
        else:
             print("  - Could not detect new version number. Please update deployment manually.")

    except Exception as e:
        print(f"  - Error updating deployment: {e}")

def deploy_github(repo_url, files):
    print(f"\n[Frontend] Deploying selected files to GitHub ({repo_url})...")
    print(f"  - Files: {', '.join(files)}")
    
    # 1. Check if git status is clean (recommended but not strictly required if we are careful)
    # Actually, we need to stash changes if any, to switch branches?
    # No, we will force checkout.
    
    temp_branch = "deploy_temp_branch"
    
    # Ensure we are on master
    run_command("git checkout -f master")
    
    # Delete temp branch if exists
    run_command(f"git branch -D {temp_branch}", ignore_error=True)
    
    # Create orphan branch
    print("  - Creating temp branch...")
    run_command(f"git checkout --orphan {temp_branch}")
    
    # Clean index (staging area) - effectively 'unstage' everything
    run_command("git reset")
    
    # We DO NOT want to clean working directory because we need the files to add!
    # Validation: Ensure selected files exist
    valid_files = []
    for f in files:
        if os.path.exists(f):
            valid_files.append(f)
        else:
            print(f"  Warning: File/Folder '{f}' does not exist. Skipping.")
            
    if not valid_files:
        print("  Error: No valid files to deploy.")
        run_command("git checkout master")
        return

    # Add selected files
    print("  - Adding files...")
    for f in valid_files:
        run_command(f"git add \"{f}\"")
        
    # Commit
    print("  - Committing...")
    run_command('git commit -m "Deploy selected files"')
    
    # Push force to main
    print("  - Pushing to main...")
    run_command(f"git push {repo_url} {temp_branch}:main -f")
    
    # Cleanup
    print("  - Cleanup...")
    run_command("git checkout -f master")
    run_command(f"git branch -D {temp_branch}")

def main():
    config = load_account_config()
    
    if not config.get('GAS_SCRIPT_ID') or not config.get('GITHUB_REPO_URL'):
        print("Error: Account configuration missing. Please run setup first or check 'Account' file.")
        # Optional: run setup script here
        sys.exit(1)
        
    gas_id = config['GAS_SCRIPT_ID']
    repo_url = config['GITHUB_REPO_URL']
    
    # Input for files
    default_files = "index.html assets style.css"
    print(f"\nSelect files/folders to deploy to GitHub 'main' branch.")
    print(f"Default: {default_files}")
    user_input = input("Enter files (space separated) [Press Enter for default]: ").strip()
    
    if not user_input:
        selected_files = default_files.split()
    else:
        selected_files = user_input.split()
        
    # Execute
    try:
        deploy_gas(gas_id)
        deploy_github(repo_url, selected_files)
        print("\nDeployment Completed Successfully!")
    except Exception as e:
        print(f"\nDeployment Failed: {e}")

if __name__ == "__main__":
    main()
