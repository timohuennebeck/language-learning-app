export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      app_config: {
        Row: {
          description: string | null;
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          description?: string | null;
          key: string;
          updated_at?: string;
          value: Json;
        };
        Update: {
          description?: string | null;
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          created_at: string;
          device_id: string | null;
          duration_seconds: number | null;
          end_reason: string | null;
          ended_at: string | null;
          id: string;
          kind: Database['public']['Enums']['conversation_kind'];
          language: string;
          level: Database['public']['Enums']['cefr_level'] | null;
          max_seconds: number;
          model: string | null;
          native_language: string;
          prompt_version: string | null;
          provider_session_id: string | null;
          review: Json | null;
          scenario_id: string | null;
          started_at: string;
          status: Database['public']['Enums']['conversation_status'];
          topic: string | null;
          transcript: Json | null;
          usage: Json | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          device_id?: string | null;
          duration_seconds?: number | null;
          end_reason?: string | null;
          ended_at?: string | null;
          id?: string;
          kind: Database['public']['Enums']['conversation_kind'];
          language: string;
          level?: Database['public']['Enums']['cefr_level'] | null;
          max_seconds?: number;
          model?: string | null;
          native_language: string;
          prompt_version?: string | null;
          provider_session_id?: string | null;
          review?: Json | null;
          scenario_id?: string | null;
          started_at?: string;
          status?: Database['public']['Enums']['conversation_status'];
          topic?: string | null;
          transcript?: Json | null;
          usage?: Json | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          device_id?: string | null;
          duration_seconds?: number | null;
          end_reason?: string | null;
          ended_at?: string | null;
          id?: string;
          kind?: Database['public']['Enums']['conversation_kind'];
          language?: string;
          level?: Database['public']['Enums']['cefr_level'] | null;
          max_seconds?: number;
          model?: string | null;
          native_language?: string;
          prompt_version?: string | null;
          provider_session_id?: string | null;
          review?: Json | null;
          scenario_id?: string | null;
          started_at?: string;
          status?: Database['public']['Enums']['conversation_status'];
          topic?: string | null;
          transcript?: Json | null;
          usage?: Json | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_language_fkey';
            columns: ['language'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'conversations_native_language_fkey';
            columns: ['native_language'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'conversations_scenario_id_fkey';
            columns: ['scenario_id'];
            isOneToOne: false;
            referencedRelation: 'scenarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      flashcards: {
        Row: {
          back: string;
          back_language: string;
          box: number;
          created_at: string;
          due: string;
          front: string;
          id: string;
          language: string;
          lapses: number;
          last_reviewed_at: string | null;
          reviews: number;
          source_conversation_id: string | null;
          user_id: string;
        };
        Insert: {
          back: string;
          back_language: string;
          box?: number;
          created_at?: string;
          due?: string;
          front: string;
          id?: string;
          language: string;
          lapses?: number;
          last_reviewed_at?: string | null;
          reviews?: number;
          source_conversation_id?: string | null;
          user_id: string;
        };
        Update: {
          back?: string;
          back_language?: string;
          box?: number;
          created_at?: string;
          due?: string;
          front?: string;
          id?: string;
          language?: string;
          lapses?: number;
          last_reviewed_at?: string | null;
          reviews?: number;
          source_conversation_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'flashcards_back_language_fkey';
            columns: ['back_language'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'flashcards_language_fkey';
            columns: ['language'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'flashcards_source_conversation_id_fkey';
            columns: ['source_conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'flashcards_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      languages: {
        Row: {
          code: string;
          is_app_language: boolean;
          learnable: boolean;
          name_native: string;
          sort_order: number;
        };
        Insert: {
          code: string;
          is_app_language?: boolean;
          learnable?: boolean;
          name_native: string;
          sort_order?: number;
        };
        Update: {
          code?: string;
          is_app_language?: boolean;
          learnable?: boolean;
          name_native?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      learner_languages: {
        Row: {
          goal: Database['public']['Enums']['learning_goal'] | null;
          language: string;
          level: Database['public']['Enums']['cefr_level'];
          level_assessed_at: string | null;
          level_source: Database['public']['Enums']['level_source'];
          placement_conversation_id: string | null;
          started_at: string;
          target_level: Database['public']['Enums']['cefr_level'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          goal?: Database['public']['Enums']['learning_goal'] | null;
          language: string;
          level?: Database['public']['Enums']['cefr_level'];
          level_assessed_at?: string | null;
          level_source?: Database['public']['Enums']['level_source'];
          placement_conversation_id?: string | null;
          started_at?: string;
          target_level?: Database['public']['Enums']['cefr_level'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          goal?: Database['public']['Enums']['learning_goal'] | null;
          language?: string;
          level?: Database['public']['Enums']['cefr_level'];
          level_assessed_at?: string | null;
          level_source?: Database['public']['Enums']['level_source'];
          placement_conversation_id?: string | null;
          started_at?: string;
          target_level?: Database['public']['Enums']['cefr_level'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'learner_languages_language_fkey';
            columns: ['language'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'learner_languages_placement_conversation_id_fkey';
            columns: ['placement_conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'learner_languages_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      legal_acceptances: {
        Row: {
          accepted_at: string;
          app_version: string | null;
          document_id: string;
          id: string;
          platform: Database['public']['Enums']['platform'] | null;
          user_id: string;
        };
        Insert: {
          accepted_at?: string;
          app_version?: string | null;
          document_id: string;
          id?: string;
          platform?: Database['public']['Enums']['platform'] | null;
          user_id: string;
        };
        Update: {
          accepted_at?: string;
          app_version?: string | null;
          document_id?: string;
          id?: string;
          platform?: Database['public']['Enums']['platform'] | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'legal_acceptances_document_id_fkey';
            columns: ['document_id'];
            isOneToOne: false;
            referencedRelation: 'legal_documents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'legal_acceptances_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      legal_documents: {
        Row: {
          content_md: string;
          effective_at: string;
          id: string;
          kind: Database['public']['Enums']['legal_doc_kind'];
          locale: string;
          requires_reacceptance: boolean;
          version: string;
        };
        Insert: {
          content_md: string;
          effective_at: string;
          id?: string;
          kind: Database['public']['Enums']['legal_doc_kind'];
          locale?: string;
          requires_reacceptance?: boolean;
          version: string;
        };
        Update: {
          content_md?: string;
          effective_at?: string;
          id?: string;
          kind?: Database['public']['Enums']['legal_doc_kind'];
          locale?: string;
          requires_reacceptance?: boolean;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'legal_documents_locale_fkey';
            columns: ['locale'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
        ];
      };
      profiles: {
        Row: {
          active_language: string | null;
          app_language: string;
          avatar_storage_path: string | null;
          created_at: string;
          goal_minutes: number;
          first_name: string;
          id: string;
          onboarding_completed_at: string | null;
          reminder_repeat: Database['public']['Enums']['reminder_repeat'];
          reminder_time: string | null;
          updated_at: string;
        };
        Insert: {
          active_language?: string | null;
          app_language?: string;
          avatar_storage_path?: string | null;
          created_at?: string;
          goal_minutes?: number;
          first_name?: string;
          id: string;
          onboarding_completed_at?: string | null;
          reminder_repeat?: Database['public']['Enums']['reminder_repeat'];
          reminder_time?: string | null;
          updated_at?: string;
        };
        Update: {
          active_language?: string | null;
          app_language?: string;
          avatar_storage_path?: string | null;
          created_at?: string;
          goal_minutes?: number;
          first_name?: string;
          id?: string;
          onboarding_completed_at?: string | null;
          reminder_repeat?: Database['public']['Enums']['reminder_repeat'];
          reminder_time?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_active_language_fkey';
            columns: ['active_language'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'profiles_app_language_fkey';
            columns: ['app_language'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
        ];
      };
      scenarios: {
        Row: {
          active: boolean;
          brief: Json;
          id: string;
          illustration_storage_path: string;
          is_placement: boolean;
          slug: string;
          language: string;
          level_max: Database['public']['Enums']['cefr_level'];
          level_min: Database['public']['Enums']['cefr_level'];
          minutes: number;
          pip_prompt: string;
          sort_order: number;
          subtitle: Json;
          tasks: Json;
          theme: Database['public']['Enums']['scenario_theme'];
          title: string;
        };
        Insert: {
          active?: boolean;
          brief?: Json;
          id?: string;
          illustration_storage_path: string;
          is_placement?: boolean;
          slug: string;
          language: string;
          level_max?: Database['public']['Enums']['cefr_level'];
          level_min?: Database['public']['Enums']['cefr_level'];
          minutes?: number;
          pip_prompt: string;
          sort_order?: number;
          subtitle?: Json;
          tasks?: Json;
          theme: Database['public']['Enums']['scenario_theme'];
          title: string;
        };
        Update: {
          active?: boolean;
          brief?: Json;
          id?: string;
          illustration_storage_path?: string;
          is_placement?: boolean;
          slug?: string;
          language?: string;
          level_max?: Database['public']['Enums']['cefr_level'];
          level_min?: Database['public']['Enums']['cefr_level'];
          minutes?: number;
          pip_prompt?: string;
          sort_order?: number;
          subtitle?: Json;
          tasks?: Json;
          theme?: Database['public']['Enums']['scenario_theme'];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scenarios_language_fkey';
            columns: ['language'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
        ];
      };
    };
    Views: {
      scenario_content_gaps: {
        Row: {
          gap: string | null;
          slug: string | null;
          language: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      cefr_level: 'A1' | 'A2' | 'B1' | 'B2';
      conversation_kind: 'placement' | 'free' | 'scenario';
      conversation_status: 'active' | 'ended' | 'failed';
      learning_goal: 'travel' | 'media' | 'family' | 'work' | 'friends' | 'fun';
      legal_doc_kind: 'terms' | 'privacy';
      level_source: 'self' | 'placement';
      platform: 'ios' | 'android' | 'web';
      reminder_repeat: 'daily' | 'weekdays' | 'weekend';
      scenario_theme: 'life' | 'travel' | 'work' | 'social' | 'culture' | 'food';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      cefr_level: ['A1', 'A2', 'B1', 'B2'],
      conversation_kind: ['placement', 'free', 'scenario'],
      conversation_status: ['active', 'ended', 'failed'],
      learning_goal: ['travel', 'media', 'family', 'work', 'friends', 'fun'],
      legal_doc_kind: ['terms', 'privacy'],
      level_source: ['self', 'placement'],
      platform: ['ios', 'android', 'web'],
      reminder_repeat: ['daily', 'weekdays', 'weekend'],
      scenario_theme: ['life', 'travel', 'work', 'social', 'culture', 'food'],
    },
  },
} as const;
