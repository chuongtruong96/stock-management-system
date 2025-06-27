package com.example.stationerymgntbe.config;

import com.example.stationerymgntbe.entity.*;
import com.example.stationerymgntbe.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.text.Normalizer;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Profile("dev")
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final ProductRepository productRepo;
    private final UnitRepository unitRepo;
    private final CategoryRepository categoryRepo;

    /* ────────── Category definitions ────��───── */
    private static final List<Category> PRESET = List.of(
            new Category(null, "Băng keo & Keo dán", "Adhesives & Tapes", "ADHESIVE", null),
            new Category(null, "Bao thư & Phong bì", "Envelopes", "ENVELOPE", null),
            new Category(null, "Bìa / File / Trang ký", "Files & Folders", "FILE", null),
            new Category(null, "Bút bi & Bút mực", "Ball-point & Gel Pens", "PEN", null),
            new Category(null, "Bút viết bảng", "Whiteboard Markers", "WHITEBOARD", null),
            new Category(null, "Bút chì & Ruột chì", "Pencils & Leads", "PENCIL", null),
            new Category(null, "Bút dạ quang / Marker", "Highlighters", "HIGHLIGHTER", null),
            new Category(null, "Gôm / Xoá / Correction", "Erasers & Correction", "CORRECTION", null),
            new Category(null, "Cắt, Dao, Kéo & Lỗ đục", "Cutting & Punching", "CUTTING", null),
            new Category(null, "Kẹp, Kim, Ghim & Bấm", "Clips & Staplers", "CLIP", null),
            new Category(null, "Giấy ghi chú & Nhãn dán", "Sticky Notes", "STICKY_NOTE", null),
            new Category(null, "Sổ / Tập / Notebook", "Notebooks", "NOTEBOOK", null),
            new Category(null, "Giấy in & Tiêu đề", "Printing Paper", "PRINT_PAPER", null),
            new Category(null, "Dụng cụ đo & Thước", "Rulers & Measuring", "RULER", null),
            new Category(null, "Khác", "Miscellaneous", "MISC", null));

    /* ────────── Keyword mapping ────────── */
    private static final Map<String, String> KW = Map.ofEntries(
            Map.entry("băng keo", "ADHESIVE"), Map.entry("keo ", "ADHESIVE"), Map.entry("stick-tack", "ADHESIVE"),
            Map.entry("bao thư", "ENVELOPE"),
            Map.entry("bìa", "FILE"), Map.entry("file", "FILE"), Map.entry("folder", "FILE"), Map.entry("mika", "FILE"),
            Map.entry("bút bi", "PEN"), Map.entry(" pen ", "PEN"), Map.entry("bút bảng", "WHITEBOARD"),
            Map.entry("bút chì", "PENCIL"), Map.entry("ruột chì", "PENCIL"),
            Map.entry("dạ quang", "HIGHLIGHTER"), Map.entry("marker", "HIGHLIGHTER"), Map.entry("lông dầu", "HIGHLIGHTER"),
            Map.entry("gôm", "CORRECTION"), Map.entry("xóa", "CORRECTION"), Map.entry("eraser", "CORRECTION"),
            Map.entry("dao ", "CUTTING"), Map.entry("kéo ", "CUTTING"), Map.entry("đục lỗ", "CUTTING"),
            Map.entry("kẹp ", "CLIP"), Map.entry("ghim", "CLIP"), Map.entry("kim bấm", "CLIP"),
            Map.entry("bấm", "CLIP"), Map.entry("gỡ kim", "CLIP"),
            Map.entry("giấy ghi chú", "STICKY_NOTE"), Map.entry("tem dán", "STICKY_NOTE"), Map.entry("decal", "STICKY_NOTE"),
            Map.entry("sổ ", "NOTEBOOK"), Map.entry("tập ", "NOTEBOOK"), Map.entry("notebook", "NOTEBOOK"), Map.entry("workbook", "NOTEBOOK"),
            Map.entry("70gsm", "PRINT_PAPER"), Map.entry("80gms", "PRINT_PAPER"), Map.entry("giấy in", "PRINT_PAPER"), Map.entry("tiêu đề", "PRINT_PAPER"),
            Map.entry("thước", "RULER"));

    /* ────────── Unit aliases ────────── */
    private static final Map<String, String> UNIT_ALIAS = Map.ofEntries(
            Map.entry("cục", "cái"),
            Map.entry("viên/vĩ", "vĩ"), Map.entry("viên", "vĩ"),
            Map.entry("vĩ", "vĩ"),
            Map.entry("bịch", "bịch"));

    /* ────────── Helper methods ────────── */
    private static String nfc(String s) {
        return Normalizer.normalize(
                s.replace('\u00A0', ' ')
                        .replaceAll("[\\t\\r\\n]", "")
                        .trim().toLowerCase(),
                Normalizer.Form.NFC);
    }

    private static String cell(Row r, int i) {
        Cell c = r.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
        if (c.getCellType() != CellType.STRING) {
            DataFormatter formatter = new DataFormatter();
            return formatter.formatCellValue(c).trim();
        }
        return c.getStringCellValue().trim();
    }

    private String group(String vi) {
        String k = nfc(vi);
        return KW.entrySet().stream()
                .filter(e -> k.contains(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst().orElse("MISC");
    }

    /* ────────── Main seeder (simplified) ────────── */
    @Bean
    @Transactional
    CommandLineRunner seedData() {
        return args -> {
            log.info("🚀 Starting data seeding...");

            /* Step 1: Setup categories */
            PRESET.forEach(c -> categoryRepo.findByCodeIgnoreCase(c.getCode())
                    .orElseGet(() -> categoryRepo.save(c)));

            /* Step 2: Setup units */
            Map<String, String> UNITS = Map.ofEntries(
                    Map.entry("cây", "piece"), Map.entry("cuộn", "roll"),
                    Map.entry("xấp", "pack"), Map.entry("hộp", "box"),
                    Map.entry("cái", "item"), Map.entry("bộ", "set"),
                    Map.entry("chai", "bottle"), Map.entry("bao", "bag"),
                    Map.entry("ream", "ream"), Map.entry("vĩ", "card"),
                    Map.entry("cặp", "pair"), Map.entry("ống", "tube"),
                    Map.entry("cục", "block"), Map.entry("cuốn", "book"),
                    Map.entry("bịch", "bag"));

            UNITS.forEach((vn, en) -> {
                String vnN = Normalizer.normalize(vn, Normalizer.Form.NFC);
                unitRepo.findByNameVnIgnoreCase(vnN)
                        .or(() -> unitRepo.findByNameEnIgnoreCase(en))
                        .orElseGet(() -> unitRepo.save(new Unit(null, vnN, en)));
            });

            /* Step 3: Process Excel data */
            try (Workbook wb = WorkbookFactory.create(
                    Objects.requireNonNull(getClass().getResourceAsStream("/VPPham.xlsx")))) {

                Sheet sh = wb.getSheetAt(0);
                boolean header = true;
                AtomicInteger ins = new AtomicInteger();
                AtomicInteger upd = new AtomicInteger();

                log.info("📊 Processing Excel data...");

                for (Row r : sh) {
                    if (header) {
                        header = false;
                        continue;
                    }

                    String code = cell(r, 1);
                    if (code.isBlank()) continue;

                    String nameVi = cell(r, 2);
                    if (nameVi.isBlank()) continue;

                    /* Process unit */
                    String raw = nfc(cell(r, 4))
                            .replaceFirst("^\\d+\\s*", "")
                            .replaceFirst("^\\d+/\\d+\\s*", "");
                    final String unitKey = UNIT_ALIAS.getOrDefault(raw, raw);

                    Unit unit = unitRepo.findByNameVnIgnoreCase(unitKey)
                            .orElseGet(() -> unitRepo.save(new Unit(null, unitKey, unitKey)));

                    Category cat = categoryRepo.findByCodeIgnoreCase(group(nameVi)).orElseThrow();

                    /* Update or insert product */
                    productRepo.findByCode(code).ifPresentOrElse(p -> {
                        boolean changed = false;
                        
                        if (!Objects.equals(p.getName(), nameVi)) {
                            p.setName(nameVi);
                            changed = true;
                        }
                        
                        if (!p.getUnit().equals(unit)) {
                            p.setUnit(unit);
                            changed = true;
                        }
                        
                        if (!p.getCategory().equals(cat)) {
                            p.setCategory(cat);
                            changed = true;
                        }
                        
                        if (changed) {
                            productRepo.save(p);
                            upd.incrementAndGet();
                        }
                    }, () -> {
                        Product newProduct = Product.builder()
                                .code(code)
                                .name(nameVi)  // Store Vietnamese name only
                                .image(null)
                                .unit(unit)
                                .category(cat)
                                .build();
                        productRepo.save(newProduct);
                        ins.incrementAndGet();
                    });
                }

                log.info("✅ Data seeding completed:");
                log.info("   📝 Inserted: {} products", ins.get());
                log.info("   🔄 Updated: {} products", upd.get());
                log.info("   💡 Translation available via /api/products/translate endpoint");

            } catch (Exception e) {
                log.error("❌ Error during seeding: {}", e.getMessage(), e);
            }
        };
    }
}