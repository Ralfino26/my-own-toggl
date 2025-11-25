'use client';

import { useState, useEffect } from 'react';
import { Project, TimeEntry } from '@/types';
import { api } from '@/lib/api';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { signOut, useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

const ProjectPieChart = dynamic(() => import('./ProjectPieChart'), {
  ssr: false,
  loading: () => <div className="w-[300px] h-[300px] flex items-center justify-center text-white/70">Laden...</div>
});

export default function ProjectList() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, entriesData] = await Promise.all([
        api.getProjects(),
        api.getTimeEntries(),
      ]);
      setProjects(projectsData);
      setTimeEntries(entriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Fout bij het laden van data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      await api.createProject(projectName.trim());
      setProjectName('');
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Fout bij het aanmaken van project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Weet je zeker dat je dit project wilt verwijderen? Alle uren worden ook verwijderd.')) {
      try {
        await api.deleteProject(projectId);
        await loadData();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Fout bij het verwijderen van project');
      }
    }
  };

  const getTotalHours = (projectId: string): number => {
    return timeEntries
      .filter(entry => entry.projectId === projectId)
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;
      const lineHeight = 7;
      const sectionSpacing = 10;

      // Titel
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Tijdregistratie Overzicht', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 1.5;

      // Datum
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const exportDate = new Date().toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc.text(`Gegenereerd op: ${exportDate}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += sectionSpacing * 2;

      // Totaal overzicht
      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Totaal Overzicht', margin, yPos);
      yPos += lineHeight * 1.5;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Totaal projecten: ${projects.length}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Totaal registraties: ${timeEntries.length}`, margin, yPos);
      yPos += lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text(`Totaal uren: ${totalHours.toFixed(2)} uur`, margin, yPos);
      yPos += sectionSpacing * 2;

      // Per project
      projects.forEach((project, index) => {
        const projectEntries = timeEntries.filter(entry => entry.projectId === project.id);
        const projectHours = getTotalHours(project.id);

        // Check of we een nieuwe pagina nodig hebben
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = margin;
        }

        // Project header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${project.name}`, margin, yPos);
        yPos += lineHeight;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Totaal: ${projectHours.toFixed(2)} uur (${projectEntries.length} registraties)`, margin + 5, yPos);
        yPos += lineHeight * 1.5;

        // Time entries tabel
        if (projectEntries.length > 0) {
          // Tabel header
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          const col1 = margin + 5;
          const col2 = col1 + 60;
          const col3 = col2 + 50;
          const col4 = col3 + 40;

          doc.text('Datum', col1, yPos);
          doc.text('Uren', col2, yPos);
          doc.text('Beschrijving', col3, yPos);
          yPos += lineHeight;

          // Tabel data
          doc.setFont('helvetica', 'normal');
          const sortedEntries = [...projectEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          sortedEntries.forEach((entry) => {
            if (yPos > pageHeight - 30) {
              doc.addPage();
              yPos = margin;
            }

            const entryDate = formatDate(entry.date);
            doc.text(entryDate, col1, yPos);
            doc.text(`${entry.hours.toFixed(2)}`, col2, yPos);
            const description = entry.description || '-';
            // Truncate description if too long
            const maxDescWidth = pageWidth - col3 - margin;
            const truncatedDesc = doc.splitTextToSize(description, maxDescWidth);
            doc.text(truncatedDesc, col3, yPos);
            yPos += lineHeight * Math.max(1, truncatedDesc.length);
          });
        } else {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text('Geen registraties', margin + 5, yPos);
          yPos += lineHeight;
        }

        yPos += sectionSpacing;
      });

      // Footer op laatste pagina
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Pagina ${i} van ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Download
      const fileName = `tijdregistratie-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Fout bij het exporteren van PDF');
    }
  };

  // Array van kleuren voor de kaarten - pas deze aan naar jouw voorkeur!
  const cardColors = [
    { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', glow: 'rgba(99, 102, 241, 0.5)', name: 'Indigo' },
    { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.3)', glow: 'rgba(236, 72, 153, 0.5)', name: 'Pink' },
    { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', glow: 'rgba(34, 197, 94, 0.5)', name: 'Green' },
    { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.3)', glow: 'rgba(251, 146, 60, 0.5)', name: 'Orange' },
    { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', glow: 'rgba(168, 85, 247, 0.5)', name: 'Purple' },
    { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', glow: 'rgba(59, 130, 246, 0.5)', name: 'Blue' },
  ];

  const getCardColor = (index: number) => {
    return cardColors[index % cardColors.length];
  };

  // Calculate pie chart data for Recharts
  const getPieChartData = () => {
    if (projects.length === 0) return null;

    const projectData = projects.map((project, index) => {
      const hours = getTotalHours(project.id);
      return {
        name: project.name,
        value: hours,
        displayValue: hours, // Keep original value for display
        projectId: project.id,
        color: getCardColor(index).border,
        glow: getCardColor(index).glow,
      };
    });

    const totalHours = projectData.reduce((sum, item) => sum + item.value, 0);
    
    // If all projects have 0 hours, use a small value for visualization but keep display as 0
    const hasAnyHours = totalHours > 0;
    const minValueForChart = 0.01; // Minimum value to show in pie chart

    // Add percentage to each item and totalHours for tooltip
    const dataWithPercentage = projectData.map(item => {
      // Use minimum value for chart if hours is 0, but keep original for display
      const chartValue = item.value > 0 ? item.value : minValueForChart;
      const effectiveTotal = hasAnyHours ? totalHours : (projectData.length * minValueForChart);
      const percentage = hasAnyHours 
        ? ((item.value / totalHours) * 100).toFixed(1)
        : ((1 / projectData.length) * 100).toFixed(1); // Equal distribution if all 0
      
      return {
        ...item,
        value: chartValue, // Use chart value for rendering
        displayValue: item.displayValue, // Keep original for display
        percentage,
        totalHours: totalHours || 0, // Use 0 if no hours yet
      };
    });

    return { data: dataWithPercentage, totalHours };
  };

  const pieChartData = getPieChartData();

  // Debug: log pie chart data
  useEffect(() => {
    if (pieChartData) {
      console.log('Pie chart data:', pieChartData);
    }
  }, [pieChartData]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            The Agency Uren
          </h1>
          {session?.user && (
            <p className="text-white/60 text-sm mt-2">
              Welkom, {session.user.username}
            </p>
          )}
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {projects.length > 0 && (
            <button
              onClick={handleExport}
              className="px-6 py-3 text-base font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-sm"
              title="Exporteer alle data"
            >
              📥 Export
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="ios-button px-6 py-3 text-base font-semibold w-full sm:w-auto"
          >
            {showAddForm ? 'Annuleren' : '+ Nieuw Project'}
          </button>
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-6 py-3 text-base font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-sm"
              title="Uitloggen"
            >
              Uitloggen
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProject} className="mb-8 p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project naam..."
              className="flex-1 px-5 py-3.5 text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              autoFocus
            />
            <button
              type="submit"
              className="ios-button px-8 py-3.5 text-base font-semibold w-full sm:w-auto"
            >
              Toevoegen
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white"></div>
          <p className="mt-4 text-white/70 text-lg">Laden...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 rounded-3xl p-12 backdrop-blur-xl bg-white/10 border border-white/20">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-xl font-semibold mb-2 text-white">Nog geen projecten</p>
          <p className="text-white/70">Maak je eerste project aan om te beginnen!</p>
        </div>
      ) : null}

      {!loading && pieChartData && (
        <div className="p-8 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Uren verdeling</h2>
              <p className="text-white/60 text-sm">
                Totaal: <span className="font-semibold text-white">{pieChartData.totalHours.toFixed(2)} uur</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col xl:flex-row items-start gap-10">
            <div className="flex-shrink-0 w-full xl:w-auto flex justify-center xl:justify-start">
              <ProjectPieChart data={pieChartData.data} />
            </div>
            <div className="flex-1 w-full">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Project overzicht</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pieChartData.data
                  .sort((a, b) => b.value - a.value) // Sort by hours descending
                  .map((item, index) => (
                    <div
                      key={`legend-${index}`}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                      style={{
                        boxShadow: `0 0 0 0 ${item.glow}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 20px ${item.glow}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 0 0 transparent';
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: item.color,
                          boxShadow: `0 0 12px ${item.glow}`,
                        }}
                      />
                      <Link
                        href={`/project/${item.projectId}`}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <p className="text-white font-semibold truncate mb-1">{item.name}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-white/90 font-bold text-lg">
                            {item.displayValue?.toFixed(2) || item.value.toFixed(2)}
                          </p>
                          <p className="text-white/60 text-sm">uur</p>
                          <span className="text-white/50">•</span>
                          <p className="text-white/70 text-sm font-medium">
                            {item.percentage}%
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteProject(item.projectId);
                        }}
                        className="text-red-400 hover:text-red-300 text-xl font-light opacity-60 hover:opacity-100 transition-opacity w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/20 flex-shrink-0"
                        title="Verwijder project"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

