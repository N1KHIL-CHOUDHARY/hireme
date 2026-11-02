'use client';

import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { countries, getCountryLabel } from '@/data/countries';
import { technicalSkills } from '@/data/technical-skills';
import { useDebounce } from '@/hooks/use-debounce';

export interface JobFilterValues {
  search: string;
  jobType: string;
  experience: string;
  workMode: string;
  location: string;
  salary: string;
  category: string;
  skills: string[];
  postingDate: string;
  sortBy: 'newest' | 'relevance' | 'salary';
}

interface JobFilterProps {
  filters: JobFilterValues;
  onChange: (filters: JobFilterValues) => void;
  totalResults?: number;
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const EXPERIENCE_LEVELS = ['Entry-level', 'Mid-level', 'Senior', 'Lead'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const CATEGORIES = ['Engineering', 'Product', 'Design', 'AI & Data', 'Marketing', 'Operations'];
const SALARY_RANGES = [
  { label: 'Any Salary', value: 'any' },
  { label: '$50,000+', value: '50000' },
  { label: '$80,000+', value: '80000' },
  { label: '$100,000+', value: '100000' },
  { label: '$150,000+', value: '150000' },
];
const POSTING_DATES = [
  { label: 'Any time', value: 'any' },
  { label: 'Past 24 hours', value: '24h' },
  { label: 'Past week', value: 'week' },
  { label: 'Past month', value: 'month' },
];

export function JobFilter({ filters, onChange, totalResults }: JobFilterProps) {
  const [searchInput, setSearchInput] = React.useState(filters.search);
  const [skillsOpen, setSkillsOpen] = React.useState(false);
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync debounced search to parent
  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.jobType && filters.jobType !== 'all') count++;
    if (filters.experience && filters.experience !== 'all') count++;
    if (filters.workMode && filters.workMode !== 'all') count++;
    if (filters.location && filters.location !== 'all') count++;
    if (filters.salary && filters.salary !== 'any') count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.postingDate && filters.postingDate !== 'any') count++;
    if (filters.skills && filters.skills.length > 0) count += filters.skills.length;
    return count;
  }, [filters]);

  const resetFilters = () => {
    setSearchInput('');
    onChange({
      search: '',
      jobType: 'all',
      experience: 'all',
      workMode: 'all',
      location: 'all',
      salary: 'any',
      category: 'all',
      skills: [],
      postingDate: 'any',
      sortBy: 'newest',
    });
  };

  const toggleSkill = (skill: string) => {
    const updated = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onChange({ ...filters, skills: updated });
  };

  const removeSkill = (skill: string) => {
    onChange({
      ...filters,
      skills: filters.skills.filter((s) => s !== skill),
    });
  };

  return (
    <div className="space-y-4">
      {/* Primary Search Bar & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by job title, company, skills or keywords..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 h-10 bg-white border-slate-200 text-sm focus-visible:ring-primary"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <Select
            value={filters.sortBy}
            onValueChange={(val: 'newest' | 'relevance' | 'salary') =>
              onChange({ ...filters, sortBy: val })
            }
          >
            <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="relevance">Relevance / Match</SelectItem>
              <SelectItem value="salary">Salary (High to Low)</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden h-10 px-3 gap-1.5 text-xs bg-white"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-primary text-white text-[10px] h-4 w-4 flex items-center justify-center font-mono">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Row (Desktop always, Mobile collapsible) */}
      <div
        className={`${
          mobileFilterOpen ? 'block' : 'hidden md:block'
        } space-y-3 pt-1 border-t border-slate-100 md:border-none`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* 1. Job Type */}
          <Select
            value={filters.jobType}
            onValueChange={(val) => onChange({ ...filters, jobType: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Types</SelectItem>
              {JOB_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 2. Experience Level */}
          <Select
            value={filters.experience}
            onValueChange={(val) => onChange({ ...filters, experience: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Experience</SelectItem>
              {EXPERIENCE_LEVELS.map((exp) => (
                <SelectItem key={exp} value={exp}>
                  {exp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 3. Work Mode */}
          <Select
            value={filters.workMode}
            onValueChange={(val) => onChange({ ...filters, workMode: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
              <SelectValue placeholder="Work Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Work Modes</SelectItem>
              {WORK_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 4. Category */}
          <Select
            value={filters.category}
            onValueChange={(val) => onChange({ ...filters, category: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 5. Location Dropdown */}
          <Popover open={locationOpen} onOpenChange={setLocationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full justify-between text-xs font-normal bg-white border-slate-200 px-3"
              >
                <span className="truncate">
                  {filters.location && filters.location !== 'all'
                    ? getCountryLabel(filters.location)
                    : 'Location'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-56" align="start">
              <Command>
                <CommandInput placeholder="Search location..." className="h-8 text-xs" />
                <CommandList>
                  <CommandEmpty>No location found</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onChange({ ...filters, location: 'all' });
                        setLocationOpen(false);
                      }}
                      className="text-xs cursor-pointer"
                    >
                      All Locations
                    </CommandItem>
                    {countries.slice(0, 30).map((c) => (
                      <CommandItem
                        key={c.value}
                        onSelect={() => {
                          onChange({ ...filters, location: c.value });
                          setLocationOpen(false);
                        }}
                        className="text-xs cursor-pointer flex items-center justify-between"
                      >
                        <span>{c.label}</span>
                        {filters.location === c.value && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* 5. Salary Range */}
          <Select
            value={filters.salary}
            onValueChange={(val) => onChange({ ...filters, salary: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
              <SelectValue placeholder="Salary" />
            </SelectTrigger>
            <SelectContent>
              {SALARY_RANGES.map((sal) => (
                <SelectItem key={sal.value} value={sal.value}>
                  {sal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 6. Posting Date */}
          <Select
            value={filters.postingDate}
            onValueChange={(val) => onChange({ ...filters, postingDate: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
              <SelectValue placeholder="Posting Date" />
            </SelectTrigger>
            <SelectContent>
              {POSTING_DATES.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skills Selector & Reset Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-normal bg-white border-slate-200 gap-1.5"
                >
                  <Filter className="h-3 w-3 text-slate-400" />
                  <span>Filter by Skills</span>
                  {filters.skills.length > 0 && (
                    <span className="ml-1 rounded-full bg-blue-50 text-primary border border-blue-100 text-[10px] px-1.5 font-mono font-medium">
                      {filters.skills.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-64" align="start">
                <Command>
                  <CommandInput placeholder="Search skills..." className="h-8 text-xs" />
                  <CommandList className="max-h-60">
                    <CommandEmpty>No skill found.</CommandEmpty>
                    <CommandGroup>
                      {technicalSkills.map((s) => (
                        <CommandItem
                          key={s.value}
                          onSelect={() => toggleSkill(s.value)}
                          className="text-xs cursor-pointer flex items-center justify-between"
                        >
                          <span>{s.label}</span>
                          {filters.skills.includes(s.value) && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Skills Chips */}
            {filters.skills.map((skill) => {
              const matched = technicalSkills.find((s) => s.value === skill);
              return (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-xs text-primary font-medium"
                >
                  {matched?.label || skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>

          {/* Results count & Clear button */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {typeof totalResults === 'number' && (
              <span className="font-mono tabular-nums">
                {totalResults} {totalResults === 1 ? 'job' : 'jobs'} available
              </span>
            )}

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-primary hover:underline font-medium cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
