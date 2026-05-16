import React, { useState, useMemo } from "react";
import styles from "./CommandPalette.module.css";

interface Command {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface CommandPaletteProps {
  onCommandSelect?: (command: string) => void;
  onClose?: () => void;
}

const AVAILABLE_COMMANDS: Command[] = [
  {
    id: "heading1",
    label: "Заголовок 1",
    description: "Большой заголовок первого уровня",
    icon: "H1",
  },
  {
    id: "heading2",
    label: "Заголовок 2",
    description: "Заголовок второго уровня",
    icon: "H2",
  },
  {
    id: "heading3",
    label: "Заголовок 3",
    description: "Заголовок третьего уровня",
    icon: "H3",
  },
  {
    id: "bulletList",
    label: "Список с точками",
    description: "Ненумерованный список",
    icon: "•",
  },
  {
    id: "orderedList",
    label: "Нумерованный список",
    description: "Нумерованный список",
    icon: "1",
  },
  {
    id: "taskList",
    label: "Список задач",
    description: "Список с чекбоксами",
    icon: "✓",
  },
  {
    id: "blockquote",
    label: "Цитата",
    description: "Отформатированная цитата",
    icon: '"',
  },
  {
    id: "codeBlock",
    label: "Блок кода",
    description: "Блок с кодом с подсветкой синтаксиса",
    icon: "</>",
  },
  {
    id: "table",
    label: "Таблица",
    description: "Вставить таблицу",
    icon: "⊞",
  },
  {
    id: "horizontalRule",
    label: "Горизонтальная линия",
    description: "Вставить разделитель",
    icon: "—",
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onCommandSelect,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    if (!search) return AVAILABLE_COMMANDS;
    return AVAILABLE_COMMANDS.filter((cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSelect = (commandId: string) => {
    onCommandSelect?.(commandId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex].id);
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose?.();
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.palette}>
      <div className={styles.searchContainer}>
        <svg
          className={styles.searchIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Введите '/' для команд..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>

      <div className={styles.commandList}>
        {filteredCommands.map((command, index) => (
          <button
            key={command.id}
            className={`${styles.commandItem} ${
              selectedIndex === index ? styles.selected : ""
            }`}
            onClick={() => handleSelect(command.id)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className={styles.icon}>{command.icon}</span>
            <div className={styles.content}>
              <div className={styles.label}>{command.label}</div>
              <div className={styles.description}>{command.description}</div>
            </div>
          </button>
        ))}

        {filteredCommands.length === 0 && (
          <div className={styles.empty}>
            <p>Команды не найдены</p>
            <p className={styles.emptyHint}>Попробуйте другой поисковый запрос</p>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.hint}>↓↑ для навигации • ↵ для выбора • ESC для закрытия</span>
      </div>
    </div>
  );
};
