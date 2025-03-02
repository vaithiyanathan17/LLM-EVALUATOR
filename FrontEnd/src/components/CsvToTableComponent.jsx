import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import axios from "axios";
import toast from "react-hot-toast";

const ExcelLikeCSVViewer = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const [loading, setLoading] = useState(false);
  const [resizing, setResizing] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const tableContainerRef = useRef(null);
  const headerContainerRef = useRef(null);

  useEffect(() => {
    if (headerContainerRef.current) {
      setHeaderHeight(
        headerContainerRef.current.getBoundingClientRect().height
      );
    }
  }, [headers]);

  const processCSV = useCallback((file) => {
    setLoading(true);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        if (meta.fields) {
          setHeaders(meta.fields);
          setColumnWidths(
            Object.fromEntries(meta.fields.map((header) => [header, 150]))
          );
        }
        setData(data);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles[0]){
        setSelectedFile(acceptedFiles[0]);
        processCSV(acceptedFiles[0]);
      } 
    },
    [processCSV]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".csv",
    multiple: false,
  });

  const handleResizeStart = (header) => (e) => {
    setResizing({
      header,
      startX: e.clientX,
      startWidth: columnWidths[header] || 150,
    });
  };

  const handleResizing = useCallback(
    (e) => {
      if (!resizing) return;
      setColumnWidths((prev) => ({
        ...prev,
        [resizing.header]: Math.max(
          50,
          resizing.startWidth + (e.clientX - resizing.startX)
        ),
      }));
    },
    [resizing]
  );

  const handleResizeEnd = useCallback(() => setResizing(null), []);

  const Row = ({ index, style }) => (
    <div style={{ ...style, display: "flex" }} className="row">
      {headers.map((header) => (
        <div
          key={header}
          className="cell"
          style={{ width: columnWidths[header] || 150 }}
        >
          {data[index]?.[header]}
        </div>
      ))}
    </div>
  );

  const clickSaveHandler = async (file) => {
    if (!file) {
        alert("No file selected!");
        return;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('columns', JSON.stringify(headers));
        const response = await axios.post('http://localhost:3000/api/upload-dataset', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        console.log('File uploaded:', response.data);

        await axios.post('http://localhost:3000/api/upload-rows', {
            datasetId: response.data.datasetId,
            rows: data,
        }, {
            headers: { 'Content-Type': 'application/json' },
        });

        toast.success("Data saved successfully!");
    } catch (error) {
        toast.error("Error saving data!");
        console.error('Upload error:', error);
    }
};



  return (
    <div
      className="excel-container"
      onMouseMove={resizing ? handleResizing : undefined}
      onMouseUp={resizing ? handleResizeEnd : undefined}
      onMouseLeave={resizing ? handleResizeEnd : undefined}
    >
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="loading">Processing CSV...</div>
        ) : (
          <div className="drop-message">
            Drag & drop CSV file, or click to select
          </div>
        )}
      </div>
      {headers.length > 0 && (
        <div className="table-container" ref={tableContainerRef}>
          <div
            className="header-container"
            ref={headerContainerRef}
            style={{
              width: headers.reduce(
                (acc, header) => acc + (columnWidths[header] || 150),
                0
              ),
            }}
          >
            <div
              className="header-row"
              style={{
                display: "flex",
                width: headers.reduce(
                  (acc, header) => acc + (columnWidths[header] || 150),
                  0
                ),
              }}
            >
              {headers.map((header) => (
                <div
                  key={header}
                  className="header-cell"
                  style={{
                    width: columnWidths[header] || 150,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span className="header-label">{header}</span>
                  <div
                    className="resize-handle"
                    onMouseDown={handleResizeStart(header)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="list-container">
            <AutoSizer>
              {({ height }) => (
                <List
                  height={height - headerHeight}
                  itemCount={data.length}
                  itemSize={35}
                  width={Object.values(columnWidths).reduce((a, b) => a + b, 0)}
                  overscanCount={5}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>
        </div>
      )}
      {data.length > 0 && (
        <div className="button-container">
          <button className="submit" type="submit" onClick={() => clickSaveHandler(selectedFile)}>
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default ExcelLikeCSVViewer;
