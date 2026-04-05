import React from 'react';

export interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

export interface Solution {
  icon: React.ElementType;
  title: string;
  description: string;
}

export interface Service {
    category: string;
    items: {
        title: string;
        description: string;
    }[];
}

export interface FaqItem {
  question: string;
  answer: string;
}