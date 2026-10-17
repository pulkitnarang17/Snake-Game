#include <vector>
#include <cstdlib>
#include <ctime>

enum Direction { STOP = 0, UP, DOWN, LEFT, RIGHT };

struct Point {
    int x;
    int y;
};

const int WIDTH = 20;
const int HEIGHT = 20;

Point head;
Point fruit;
std::vector<Point> body;
Direction dir = STOP;
int score = 0;
bool gameOver = false;

void spawnFruit() {
    bool onSnake;
    do {
        onSnake = false;
        fruit.x = rand() % WIDTH;
        fruit.y = rand() % HEIGHT;
        if (fruit.x == head.x && fruit.y == head.y) onSnake = true;
        for (const auto& pt : body) {
            if (fruit.x == pt.x && fruit.y == pt.y) {
                onSnake = true;
                break;
            }
        }
    } while (onSnake);
}

extern "C" {

void initGame() {
    srand(static_cast<unsigned int>(time(nullptr)));
    head = { WIDTH / 2, HEIGHT / 2 };
    body.clear();
    dir = STOP;
    score = 0;
    gameOver = false;
    spawnFruit();
}

void setDirection(int d) {
    Direction newDir = static_cast<Direction>(d);
    if (dir == UP && newDir == DOWN) return;
    if (dir == DOWN && newDir == UP) return;
    if (dir == LEFT && newDir == RIGHT) return;
    if (dir == RIGHT && newDir == LEFT) return;
    dir = newDir;
}

void updateGame() {
    if (gameOver || dir == STOP) return;

    if (!body.empty()) {
        body.insert(body.begin(), head);
        body.pop_back();
    }

    switch (dir) {
        case UP:    head.y--; break;
        case DOWN:  head.y++; break;
        case LEFT:  head.x--; break;
        case RIGHT: head.x++; break;
        default: break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT) {
        gameOver = true;
        return;
    }

    // Body collision
    for (const auto& pt : body) {
        if (head.x == pt.x && head.y == pt.y) {
            gameOver = true;
            return;
        }
    }

    // Eat fruit
    if (head.x == fruit.x && head.y == fruit.y) {
        score += 10;
        body.push_back(head);
        spawnFruit();
    }
}

int getHeadX() { return head.x; }
int getHeadY() { return head.y; }
int getFruitX() { return fruit.x; }
int getFruitY() { return fruit.y; }
int getScore() { return score; }
int isGameOver() { return gameOver ? 1 : 0; }
int getBodyLength() { return static_cast<int>(body.size()); }
int getBodyX(int index) { return body[index].x; }
int getBodyY(int index) { return body[index].y; }

}