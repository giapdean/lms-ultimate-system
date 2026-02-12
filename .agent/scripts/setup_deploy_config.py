import os
import json
import subprocess
import sys

# Paths
BASE_DIR = os.getcwd() # Assumes running from root as per workflow
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

def save_account_config(config):
    with open(ACCOUNT_FILE, 'w', encoding='utf-8') as f:
        for key, value in config.items():
            f.write(f"{key}={value}\n")
    print(f"Configuration saved to {ACCOUNT_FILE}")

def update_clasp_json(script_id):
    if not os.path.exists(CLASP_JSON):
        print(f"{CLASP_JSON} not found. Skipping clasp update.")
        return

    try:
        with open(CLASP_JSON, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if data.get('scriptId') != script_id:
            data['scriptId'] = script_id
            with open(CLASP_JSON, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print(f"Updated .clasp.json with Script ID: {script_id}")
        else:
            print(".clasp.json already has the correct Script ID.")
            
    except Exception as e:
        print(f"Error updating .clasp.json: {e}")

def update_git_remote(repo_url):
    try:
        # Check current remote
        result = subprocess.run(['git', 'remote', 'get-url', 'origin'], capture_output=True, text=True)
        current_url = result.stdout.strip()

        if result.returncode == 0:
            if current_url != repo_url:
                subprocess.run(['git', 'remote', 'set-url', 'origin', repo_url], check=True)
                print(f"Updated git remote 'origin' to: {repo_url}")
            else:
                print("Git remote 'origin' is already set correctly.")
        else:
            # Remote doesn't exist? valid case to add
             subprocess.run(['git', 'remote', 'add', 'origin', repo_url], check=True)
             print(f"Added git remote 'origin': {repo_url}")

    except subprocess.CalledProcessError as e:
        print(f"Error updating git remote: {e}")

def main():
    print("Setting up deployment configuration...")
    
    config = load_account_config()
    
    # Prompt if missing
    gas_script_id = config.get('GAS_SCRIPT_ID')
    github_repo_url = config.get('GITHUB_REPO_URL')
    
    dirty = False
    
    if not gas_script_id:
        print("\nGAS Script ID not found in 'Account' file.")
        gas_script_id = input("Enter Google Apps Script ID (Script ID): ").strip()
        if gas_script_id:
            config['GAS_SCRIPT_ID'] = gas_script_id
            dirty = True
        else:
            print("GAS Script ID is required!")
            sys.exit(1)

    if not github_repo_url:
        print("\nGitHub Repo URL not found in 'Account' file.")
        github_repo_url = input("Enter GitHub Repository URL (e.g. https://github.com/user/repo.git): ").strip()
        if github_repo_url:
            config['GITHUB_REPO_URL'] = github_repo_url
            dirty = True
        else:
             print("GitHub Repo URL is required!")
             sys.exit(1)
             
    if dirty:
        save_account_config(config)
        
    # Apply configurations
    if gas_script_id:
        update_clasp_json(gas_script_id)
        
    if github_repo_url:
        update_git_remote(github_repo_url)
        
    print("\nSetup complete! Ready to push.")

if __name__ == "__main__":
    main()
