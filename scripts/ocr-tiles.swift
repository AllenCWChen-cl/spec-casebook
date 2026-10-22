// OCR rendered spec tiles with Apple's Vision framework (English, Traditional/Simplified Chinese, Japanese).
// Swift because Vision is only reachable from Swift/Objective-C. Figma PDF exports often lack a usable
// Unicode mapping for CJK text, so OCR of the rendered tiles is the reliable source of annotation text.
// Usage: swift scripts/ocr-tiles.swift <tiles dir>
//   Reads <tiles dir>/index.json (written by render-tiles.ts) and writes <tiles dir>/ocr.json:
//   [{ file, lines: [{ text, x, y, w, h, conf }] }] with x/y/w/h in PDF points on the page.
import Foundation
import Vision
import ImageIO

struct Tile: Codable { let file: String; let x: Double; let y: Double; let w: Double; let h: Double }
struct Index: Codable { let tiles: [Tile]; let scale: Double }
struct Line: Codable { let text: String; let x: Int; let y: Int; let w: Int; let h: Int; let conf: Float }
struct Out: Codable { let file: String; let x: Double; let y: Double; let lines: [Line] }

let dir = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : ".")
let index = try JSONDecoder().decode(Index.self, from: Data(contentsOf: dir.appendingPathComponent("index.json")))
var results: [Out] = []
for (n, t) in index.tiles.enumerated() {
  let url = dir.appendingPathComponent(t.file)
  guard let src = CGImageSourceCreateWithURL(url as CFURL, nil), let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { continue }
  let req = VNRecognizeTextRequest()
  req.recognitionLevel = .accurate
  req.usesLanguageCorrection = true
  req.recognitionLanguages = ["zh-Hant", "en-US", "ja-JP", "zh-Hans"]
  try VNImageRequestHandler(cgImage: img, options: [:]).perform([req])
  let W = Double(img.width), H = Double(img.height)
  let lines: [Line] = (req.results ?? []).compactMap { o in
    guard let c = o.topCandidates(1).first else { return nil }
    let b = o.boundingBox  // normalized, bottom-left origin
    // tile pixels -> PDF points: divide by the render scale, offset by the tile origin
    let px = b.minX * W, py = (1 - b.maxY) * H
    return Line(text: c.string, x: Int(t.x + px / index.scale), y: Int(t.y + py / index.scale),
                w: Int(b.width * W / index.scale), h: Int(b.height * H / index.scale), conf: c.confidence)
  }
  results.append(Out(file: t.file, x: t.x, y: t.y, lines: lines))
  FileHandle.standardError.write("\(n + 1)/\(index.tiles.count) \(t.file): \(lines.count) lines\n".data(using: .utf8)!)
}
let enc = JSONEncoder(); enc.outputFormatting = [.prettyPrinted, .withoutEscapingSlashes]
try enc.encode(results).write(to: dir.appendingPathComponent("ocr.json"))
print("OCR: \(results.count) tiles → \(dir.appendingPathComponent("ocr.json").path)")
