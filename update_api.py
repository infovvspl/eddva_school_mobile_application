import re

with open('src/utils/api.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove mockData object completely.
# It starts with 'const mockData: Record<string, any> = {'
# and ends right before 'export const fetchApi = async'
# We can use regex or string find.
start_str = 'const mockData: Record<string, any> = {'
end_str = 'export const fetchApi = async'

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]

# In fetchApi, remove the catch block fallback
# Look for catch (error) { ... }
# The catch block ends at the end of the fetchApi function
# We can just replace the whole fetchApi function up to `export const schoolApi = {`
fetch_api_start = content.find('export const fetchApi = async')
school_api_start = content.find('export const schoolApi = {')

if fetch_api_start != -1 and school_api_start != -1:
    new_fetch_api = """export const fetchApi = async (endpoint: string, options: RequestInit = {}, isAiEngine = false) => {
  const baseUrl = isAiEngine ? AI_BASE_URL : BASE_URL;
  const url = `${baseUrl}${endpoint}`;
  
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'API Error');
    }

    return await response.json();
  } catch (error) {
    console.warn(`API Error (${endpoint}):`, error);
    throw error;
  }
};

"""
    content = content[:fetch_api_start] + new_fetch_api + content[school_api_start:]

with open('src/utils/api.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("api.ts updated successfully")
