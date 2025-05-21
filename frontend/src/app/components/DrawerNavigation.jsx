import { useState, useRef } from 'react';

const DrawerNavigation = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(320);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const toggleMaximize = () => {
    setIsMaximized((prev) => !prev);
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleMouseDown = (e) => {
    startX.current = e.clientX;
    startWidth.current = drawerWidth;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const delta = startX.current - e.clientX;
    const newWidth = startWidth.current + delta;
    const minWidth = window.innerWidth * 0.2;
    const maxWidth = window.innerWidth;
    const newWidthClamped = Math.min(maxWidth, Math.max(minWidth, newWidth));

    setDrawerWidth(newWidthClamped);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const closeDrawer = () => {
    document.getElementById('drawer-navigation').style.display = 'none';
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div
            className={`bg-blue-500 p-1 rounded-lg shadow-lg transition-all duration-300 ${isMaximized ? 'w-full h-full' : 'w-3/4 h-3/4'}`}
          >
            <div className="flex flex-row items-center justify-end space-x-2">
              <button
                onClick={toggleMaximize}
                className="bg-blue-600 text-white py-1 px-2 rounded flex items-center justify-center w-10 h-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 14l2 2 4-4M5 12h14M12 5v14"
                  />
                </svg>
              </button>

              <button
                onClick={toggleModal}
                className="bg-red-600 text-white py-1 px-2 rounded flex items-center justify-center w-10 h-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {isDrawerOpen && (
        <div
          id="drawer-navigation"
          className={`fixed top-0 right-0 z-40 p-4 overflow-y-auto transition-transform ${isMaximized ? 'w-full h-full' : 'w-[256px] h-[100vh]'}`}
          style={{
            display: 'none',
            marginTop: '136px',
            width: isMaximized ? '100%' : `${drawerWidth}px`,
            height: 'calc(100vh - 130px)',
            backgroundColor: '#F3F4F6',
          }}
          tabIndex="-1"
          aria-labelledby="drawer-navigation-label"
        >
          <h5
            id="drawer-navigation-label"
            className="text-base font-semibold text-gray-800 uppercase"
          >
            Sidebar
          </h5>

          <div className="absolute top-2.5 right-2.5 flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleModal}
              className="text-gray-800 bg-transparent hover:bg-blue-400 hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9 1a1 1 0 0 1 1 1v16a1 1 0 0 1-2 0V2a1 1 0 0 1 1-1Z"
                ></path>
                <path
                  fillRule="evenodd"
                  d="M2 9a1 1 0 0 1 1-1h16a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1Z"
                ></path>
              </svg>
              <span className="sr-only">Open Modal</span>
            </button>

            <button
              type="button"
              onClick={toggleMaximize}
              className="text-gray-800 bg-transparent hover:bg-blue-400 hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm0 12V5h10v10H5Z"
                ></path>
              </svg>
              <span className="sr-only">Maximize</span>
            </button>

            <button
              type="button"
              onClick={closeDrawer}
              className="text-gray-800 bg-transparent hover:bg-red-400 hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                style={{ strokeWidth: '2px' }}
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 11-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 11-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Close Drawer</span>
            </button>
          </div>

          <div
            className="absolute top-0 left-0 w-0.5 h-full cursor-ew-resize bg-gray-600"
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </>
  );
};

export default DrawerNavigation;
