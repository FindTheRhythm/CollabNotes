import React, { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { useNotes } from "@/hooks/useNotes";
import { useToast } from "@/hooks/useToast";
import Sidebar from "@/components/layout/Sidebar";
import NotebookPanel from "@/components/layout/NotebookPanel";
import SectionPanel from "@/components/layout/SectionPanel";
import PagePanel from "@/components/layout/PagePanel";
import TiptapEditor from "@/components/editor/TiptapEditor";
import VersionsPanel from "@/components/editor/VersionsPanel";
import BlockList from "@/components/editor/BlockList";
import api from "@/api/client";
import { useDispatch } from "react-redux";
import { clearError as clearNoteError } from "@/store/noteSlice";
import { AppDispatch } from "@/store/index";

export default function NotesPage(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>();
  const hookResult = useNotes();
  const notes = hookResult.notes || [];
  const { isLoading, error } = hookResult;
  const { showError } = useToast();
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const workspaceId = "workspace-demo";

  const [notebooks, setNotebooks] = useState([
    { id: "nb1", title: "Учеба" },
    { id: "nb2", title: "Работа" },
    { id: "nb3", title: "Личное" }
  ]);

  const [sections, setSections] = useState([
    { id: "s1", title: "Java" },
    { id: "s2", title: "PostgreSQL" },
    { id: "s3", title: "React" }
  ]);

  const [pages, setPages] = useState([
    { id: "p1", title: "ООП" },
    { id: "p2", title: "Интерфейсы" },
    { id: "p3", title: "Streams API" }
  ]);

  const [blocks, setBlocks] = useState([
    { id: "b1", type: "heading", content: "ООП — введение" },
    { id: "b2", type: "text", content: "Принципы инкапсуляции, наследования и полиморфизма." },
    { id: "b3", type: "code", content: { code: "class Foo {}" } }
  ]);

  console.log("[NOTES PAGE] Rendered with notes:", notes, "isLoading:", isLoading, "error:", error);

  // Show error notification when error state changes
  useEffect(() => {
    if (error) {
      showError(new Error(error), "Notes Operation Failed");
    }
  }, [error, showError]);

  // Clear error on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearNoteError());
    };
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="workspace-view">
        <div className="workspace-columns">
          <div className="col col-left">
            <Sidebar>
              <NotebookPanel
                notebooks={notebooks}
                onSelect={id => setSelectedNotebook(id)}
                onReorder={async orderedIds => {
                  setNotebooks(prev => orderedIds.map(id => prev.find(item => item.id === id)!).filter(Boolean));
                  try {
                    await api.post('/notebooks/reorder', { workspaceId, orderedIds });
                  } catch (err) {
                    console.error('Notebook reorder failed', err);
                  }
                }}
              />
            </Sidebar>
          </div>

          <div className="col col-middle">
            <SectionPanel
              sections={sections}
              onSelect={id => setSelectedSection(id)}
              onReorder={async orderedIds => {
                setSections(prev => orderedIds.map(id => prev.find(item => item.id === id)!).filter(Boolean));
                if (!selectedNotebook) {
                  console.warn('Section reorder skipped because notebook is not selected');
                  return;
                }

                try {
                  await api.post('/notebooks/sections/reorder', { notebookId: selectedNotebook, orderedIds });
                } catch (err) {
                  console.error('Section reorder failed', err);
                }
              }}
            />
          </div>

          <div className="col col-right">
            <PagePanel
              pages={pages}
              sectionId={selectedSection}
              onSelect={id => setSelectedPage(id)}
              onReorder={orderedIds => setPages(prev => orderedIds.map(id => prev.find(item => item.id === id)!).filter(Boolean))}
            />
          </div>

          <div className="col col-center">
            <div className="page-editor-header">
              <h2>{pages.find(p => p.id === selectedPage)?.title || "Выберите страницу"}</h2>
              <div className="versions-toggle">
                <VersionsPanel pageId={selectedPage || undefined} />
              </div>
            </div>
            <div className="page-editor">
              <TiptapEditor pageId={selectedPage || undefined} content={"<h2>Start writing...</h2>"} onUpdate={() => {}} autosave />
              <BlockList pageId={selectedPage} blocks={blocks} onChange={setBlocks} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
