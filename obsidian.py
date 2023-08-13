import os
import datetime
import re

OBSIDIAN_PATH = "/Users/sjfbo/Documents/Mind"
JEKYLL_POSTS_PATH = "/Users/sjfbo/dev/sjfbo.github.io/_posts"

def get_categories(path):
    return [f for f in os.listdir(path) if os.path.isdir(os.path.join(path, f))]

def ordinal(number):
    """Return number with an ordinal string suffix."""
    if 10 <= number % 100 <= 20:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(number % 10, 'th')
    return f"{number}{suffix}"

def create_jekyll_post(category, date_str, content):
    # Convert the date string to a datetime object
    date_obj = datetime.datetime.strptime(date_str, '%d-%m-%Y')
    
    # Create a filename using the Jekyll convention
    filename = f"{date_obj.strftime('%Y-%m-%d')}-{category.lower().replace(' ', '-')}.md"
    
    # Generate the post title and date for Jekyll front matter
    title = f"Notes — week of {date_obj.strftime('%d/%m/%Y')}"
    jekyll_date = f"{date_obj.strftime('%Y-%m-%d')} 10:00:00 +0000"

    # Remove the Obsidian metadata from the content
    content = content.split("---", 2)[-1].strip()

    # Add Jekyll front matter
    front_matter = f"""---
layout: post
title: "{title}"
date:  {jekyll_date}
tags:  
- {category.lower()}
---

"""
    with open(os.path.join(JEKYLL_POSTS_PATH, filename), 'w') as f:
        f.write(front_matter + content)

def main():
    # Regular expression to check if folder name matches DD-MM-YYYY format
    date_pattern = re.compile(r'\d{2}-\d{2}-\d{4}')
    
    for category in get_categories(OBSIDIAN_PATH):
        category_path = os.path.join(OBSIDIAN_PATH, category)
        for date_str in os.listdir(category_path):
            # Skip if the folder name doesn't match the expected format
            if not date_pattern.match(date_str):
                continue
            
            date_path = os.path.join(category_path, date_str)
            compiled_content = ""
            for note in os.listdir(date_path):
                with open(os.path.join(date_path, note), 'r') as f:
                    compiled_content += f.read() + "\n\n"
            create_jekyll_post(category, date_str, compiled_content)


if __name__ == "__main__":
    main()

