"use client";

import { useState, useRef, useEffect } from "react";
import { Search, User, Loader2 } from "lucide-react";
// import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 1) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search-users?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const users = await response.json();
        setResults(users);
        setIsDropdownOpen(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (username: string) => {
    setQuery("");
    setResults([]);
    setIsDropdownOpen(false);
    router.push(`/profile/${username}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsDropdownOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>

      {isDropdownOpen && results.length > 0 && (
        <div className="absolute text-black z-50 w-full mt-2 bg-gray-300 rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => handleResultClick(user.username || user.id)}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full object-cover mr-3"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isDropdownOpen && query.length > 1 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-md shadow-lg border border-gray-200 p-4">
          <p className="text-gray-500 text-center">No users found</p>
        </div>
      )}
    </div>
  );
}

export default SearchBar;