using System;
using System.IO;
using System.Collections.Specialized;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

class Program {
    [DllImport("user32.dll")]
    static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    [DllImport("user32.dll")]
    static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    static extern uint GetWindowThreadProcessId(IntPtr hWnd, IntPtr ProcessId);

    [DllImport("user32.dll")]
    static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

    [DllImport("kernel32.dll")]
    static extern uint GetCurrentThreadId();

    const int KEYEVENTF_KEYUP = 0x0002;
    const byte VK_LWIN = 0x5B;
    const byte VK_RWIN = 0x5C;
    const byte VK_CONTROL = 0x11;
    const byte VK_V = 0x56;
    const byte VK_SHIFT = 0x10;
    const byte VK_MENU = 0x12;

    [STAThread]
    static void Main(string[] args) {
        if (args.Length > 0 && args[0] == "get-foreground") {
            Console.WriteLine(GetForegroundWindow().ToInt64());
            return;
        }

        long targetHwndVal = 0;
        string filePath = null;
        string text = null;

        for (int i = 0; i < args.Length; i++) {
            if (args[i] == "--hwnd" && i + 1 < args.Length) {
                long.TryParse(args[i + 1], out targetHwndVal);
                i++;
            } else if (args[i] == "--file" && i + 1 < args.Length) {
                filePath = args[i + 1];
                i++;
            } else if (args[i] == "--text" && i + 1 < args.Length) {
                text = args[i + 1];
                i++;
            }
        }

        // 1. Populate multi-format clipboard if filePath is provided
        if (!string.IsNullOrEmpty(filePath) && File.Exists(filePath)) {
            try {
                DataObject dataObj = new DataObject();
                
                // FileDrop
                StringCollection files = new StringCollection();
                files.Add(filePath);
                dataObj.SetFileDropList(files);

                // Text
                if (!string.IsNullOrEmpty(text)) {
                    dataObj.SetText(text);
                } else {
                    dataObj.SetText(Path.GetFileName(filePath));
                }

                // Bitmap (if image)
                try {
                    using (Image img = Image.FromFile(filePath)) {
                        dataObj.SetImage(new Bitmap(img));
                    }
                } catch {}

                Clipboard.SetDataObject(dataObj, true);
            } catch (Exception ex) {
                Console.Error.WriteLine("Clipboard error: " + ex.Message);
            }
        }

        // 2. Restore foreground window
        if (targetHwndVal != 0) {
            IntPtr targetHwnd = new IntPtr(targetHwndVal);
            uint targetThread = GetWindowThreadProcessId(targetHwnd, IntPtr.Zero);
            uint currentThread = GetCurrentThreadId();

            if (targetThread != 0 && targetThread != currentThread) {
                AttachThreadInput(currentThread, targetThread, true);
            }

            SetForegroundWindow(targetHwnd);
            Thread.Sleep(80);

            if (targetThread != 0 && targetThread != currentThread) {
                AttachThreadInput(currentThread, targetThread, false);
            }
        }

        // 3. Clear stuck modifiers
        keybd_event(VK_LWIN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_RWIN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_SHIFT, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);

        Thread.Sleep(30);

        // 4. Send Ctrl+V
        keybd_event(VK_CONTROL, 0, 0, UIntPtr.Zero);
        Thread.Sleep(15);
        keybd_event(VK_V, 0, 0, UIntPtr.Zero);
        Thread.Sleep(15);
        keybd_event(VK_V, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        Thread.Sleep(15);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);

        Console.WriteLine("SUCCESS");
    }
}
