import os
import glob

def mass_replace(paths):
    for p in paths:
        if os.path.isdir(p):
            for root, dirs, files in os.walk(p):
                for name in files:
                    if not (name.endswith('.tsx') or name.endswith('.ts')):
                        continue
                    process_file(os.path.join(root, name))
        else:
            process_file(p)

def process_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    content = content.replace("reddit_discovery", "x_discovery")
    content = content.replace("reddit-discovery", "x-discovery")
    content = content.replace("RedditDiscovery", "XDiscovery")
    content = content.replace("Reddit Discovery", "X Discovery")
    content = content.replace("reddit_search", "x_search")
    content = content.replace("RedditSearch", "XSearch")
    content = content.replace("Reddit", "X")
    content = content.replace("reddit", "x")
    content = content.replace("REDDIT", "X")
    content = content.replace("subreddits", "keywords") # To remove subreddits inputs naturally in UI
    content = content.replace("Subreddits", "Keywords")
    
    with open(path, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    mass_replace([
        "/home/ubuntu/zooptics/rdagent-frontend/app/x-discovery",
        "/home/ubuntu/zooptics/rdagent-frontend/components/kokonutui/x-discovery-chat.tsx"
    ])
    print("Frontend replace done.")
