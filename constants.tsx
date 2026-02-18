
import React from 'react';
import { Resource } from './types';

export const COLORS = {
  PRIMARY_RED: '#B40101',
  BLACK: '#000000',
  BG_GRAY: '#f8f9fa'
};

export const RESOURCES: Resource[] = [
  { title: "30-30-40 Analysis", url: "https://drive.google.com/uc?export=download&id=1Ht0HCWUMBGQIX0sZ6bE4YOJyEgxSBavZ" },
  { title: "KW Technology Map", url: "https://drive.google.com/uc?export=download&id=1gEu8J7x6-GiwqudEorA-xxrSnk5cFAma" },
  { title: "Needs Analysis Tool", url: "https://drive.google.com/uc?export=download&id=1CjUWfaQgadIulnoko2IbedV9-dcjIlk7" },
  { title: "People Assessment", url: "https://drive.google.com/uc?export=download&id=1zQuEb18kLzZj91I42AUM8f9-5RIZpzBG" },
  { title: "People Assessment Guide", url: "https://drive.google.com/uc?export=download&id=1zcJwnp3m6dobOJUDdX4xeUlLfCtK3Xbw" },
  { title: "Consulting Conversations Guide", url: "https://drive.google.com/uc?export=download&id=1VyCvHHHSgN4MR6Q7GqVInMYm7nYwoOZf" },
  { title: "Recruiting with Brain in Mind", url: "https://drive.google.com/uc?export=download&id=1jQ8xfuDHJtVGAG1m5ZEAFUIhIxuyCDGC" }
];

export const NEEDS_ANALYSIS_FRAMEWORK = [
  { q: "What are your goals?", desc: "Define their desired future state." },
  { q: "Why are those goals important to you?", desc: "Connect with their emotional drivers." },
  { q: "Where is your business right now?", desc: "Establish the current reality." },
  { q: "Where are the gaps?", desc: "Identify the friction and missing pieces." }
];

export const EMPTY_AGENT_DATA = {
  agentName: '',
  currentBrokerage: '',
  closedVolume: '',
  closedUnits: '',
  listingsTaken: '',
  gci: '',
  commissionRate: '',
  buySideUnits: '',
  sellSideUnits: '',
  yearsInBusiness: '',
  primaryServiceArea: '',
  marketShare: '',
  averageDaysOnMarket: '',
  productionTrend: '',
};
